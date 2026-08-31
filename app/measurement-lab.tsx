"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "simulation" | "real";
type Light = "good" | "normal" | "dim";
type Measurement = {
  distance: number;
  simulated?: number;
  simulatedHamming?: number;
  simulatedMargin?: number;
  real?: number;
  realHamming?: number;
  realMargin?: number;
  note?: string;
};

const initialRows: Measurement[] = [40,60,80].map(distance => ({distance}));

function CameraFeed() { const videoRef = useRef<HTMLVideoElement>(null); const [live,setLive] = useState(false); const start = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false}); if (videoRef.current) videoRef.current.srcObject = stream; setLive(true); } catch { setLive(false); } }; useEffect(() => () => { const stream = videoRef.current?.srcObject as MediaStream | null; stream?.getTracks().forEach(track => track.stop()); }, []); return <div className={`camera-stage measurement-camera ${live ? "live" : ""}`}><video ref={videoRef} autoPlay muted playsInline/><div className="camera-overlay"><span>{live ? "● CAMERA LAPTOP · LIVE" : "CAMERA LAPTOP · SẴN SÀNG"}</span><b>ĐO z_m</b></div>{!live && <div className="camera-empty"><div className="camera-glyph">⌾</div><strong>Đưa AprilTag thật vào khung hình</strong><small>Camera laptop đang đóng vai camera JetBot trong bài đo.</small><button className="primary" onClick={start}>Bật camera laptop</button></div>}</div>; }

export default function MeasurementLab({onComplete}:{onComplete:()=>void}) {
  const [mode,setMode] = useState<Mode>("simulation");
  const [selected,setSelected] = useState(40);
  const [angle,setAngle] = useState(0);
  const [light,setLight] = useState<Light>("good");
  const [tagSize,setTagSize] = useState(.15);
  const [realZ,setRealZ] = useState("");
  const [realHamming,setRealHamming] = useState("0");
  const [realMargin,setRealMargin] = useState("");
  const [note,setNote] = useState("");
  const [student,setStudent] = useState("");
  const [studentClass,setStudentClass] = useState("");
  const [rows,setRows] = useState<Measurement[]>(initialRows);
  const [measureCount,setMeasureCount] = useState(0);
  const [message,setMessage] = useState("Chọn khoảng cách rồi bấm Đo mô phỏng.");

  useEffect(() => {
    const saved = localStorage.getItem("jetbot-measurements");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data.rows)) setRows(data.rows);
      setStudent(data.student || "");
      setStudentClass(data.studentClass || "");
    } catch { localStorage.removeItem("jetbot-measurements"); }
  }, []);
  useEffect(() => {
    localStorage.setItem("jetbot-measurements", JSON.stringify({rows,student,studentClass}));
  }, [rows,student,studentClass]);

  const current = rows.find(row => row.distance === selected);
  const simCount = rows.filter(row => row.simulated !== undefined).length;
  const realCount = rows.filter(row => row.real !== undefined).length;
  const comparisonCount = rows.filter(row => row.simulated !== undefined && row.real !== undefined).length;
  const averageRealError = useMemo(() => {
    const values = rows.filter(row => row.real !== undefined).map(row => Math.abs((row.real || 0) - row.distance/100) * 100);
    return values.length ? values.reduce((sum,value) => sum + value,0)/values.length : 0;
  }, [rows]);

  const simulate = () => {
    const actual = selected / 100;
    const lightPenalty = light === "good" ? 0 : light === "normal" ? .008 : .024;
    const anglePenalty = angle * .00034;
    const distancePenalty = actual * .009;
    const variation = Math.sin((selected + angle + measureCount * 17) * .83) * (distancePenalty + anglePenalty + lightPenalty);
    const sizeBias = tagSize / .15;
    const measured = Math.max(.05, +(actual * sizeBias + variation).toFixed(3));
    const hamming = light === "dim" || angle >= 50 ? 1 : 0;
    const margin = Math.max(8, Math.round(98 - selected*.32 - angle*.62 - (light === "dim" ? 27 : light === "normal" ? 10 : 0)));
    setRows(items => items.map(row => row.distance === selected ? {...row,simulated:measured,simulatedHamming:hamming,simulatedMargin:margin} : row));
    setMeasureCount(count => count + 1);
    const error = Math.abs(measured - actual) * 100;
    setMessage(error <= 2 ? `Đã đo ${measured.toFixed(3)} m — sai số ${error.toFixed(1)} cm, kết quả tốt.` : `Đã đo ${measured.toFixed(3)} m — sai số ${error.toFixed(1)} cm. Hãy kiểm tra góc, ánh sáng hoặc TAG_SIZE.`);
  };

  const saveReal = () => {
    const z = Number(realZ), hamming = Number(realHamming), margin = Number(realMargin);
    if (!Number.isFinite(z) || z <= 0 || !Number.isFinite(hamming) || !Number.isFinite(margin)) {
      setMessage("Chưa thể lưu: hãy nhập đủ z_m, Hamming và Margin bằng số.");
      return;
    }
    setRows(items => items.map(row => row.distance === selected ? {...row,real:+z.toFixed(3),realHamming:hamming,realMargin:margin,note} : row));
    setMessage(`Đã lưu số liệu thật tại ${selected} cm. Bảng so sánh đã được cập nhật.`);
  };

  const selectDistance = (distance:number) => {
    setSelected(distance);
    const row = rows.find(item => item.distance === distance);
    setRealZ(row?.real?.toString() || "");
    setRealHamming(row?.realHamming?.toString() || "0");
    setRealMargin(row?.realMargin?.toString() || "");
    setNote(row?.note || "");
  };

  const exportCsv = () => {
    const header = ["Học sinh","Lớp","Khoảng cách thật (cm)","Mô phỏng z_m (m)","Số đo JetBot z_m (m)","Sai số mô phỏng (cm)","Sai số thực (cm)","Hamming thực","Margin thực","Ghi chú"];
    const body = rows.map(row => [student,studentClass,row.distance,row.simulated ?? "",row.real ?? "",row.simulated === undefined ? "" : (Math.abs(row.simulated-row.distance/100)*100).toFixed(2),row.real === undefined ? "" : (Math.abs(row.real-row.distance/100)*100).toFixed(2),row.realHamming ?? "",row.realMargin ?? "",row.note ?? ""]);
    const csv = "\uFEFF" + [header,...body].map(line => line.map(value => `"${String(value).replaceAll('"','""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "phieu-ket-qua-apriltag.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  const reset = () => { setRows(initialRows); setMessage("Đã xóa bảng đo. Hãy bắt đầu lại tại 40 cm."); };

  return <section className="measurement-lab">
    <div className="lab-heading"><div><span>PHÒNG ĐO APRILTAG</span><h3>Mô phỏng và số liệu JetBot thật</h3><p>Đo cùng một mốc 40/60/80 cm ở hai chế độ rồi so sánh sai số.</p></div><div className="mode-switch" role="group" aria-label="Chọn chế độ đo"><button className={mode==="simulation"?"active":""} onClick={() => setMode("simulation")}>◉ Mô phỏng</button><button className={mode==="real"?"active":""} onClick={() => setMode("real")}>↗ Thực nghiệm thật</button></div></div><div className="video-guide"><div><span>VIDEO HƯỚNG DẪN TỪ YOUTUBE</span><p>Xem cách đọc z_m, Hamming và Margin trong quy trình đo AprilTag, rồi tự đo đủ ba mốc trong phòng đo.</p></div><iframe title="Video hướng dẫn đo khoảng cách AprilTag" src="https://www.youtube.com/embed?listType=search&list=AprilTag%20distance%20measurement%20JetBot" loading="lazy" allowFullScreen/></div>
    <CameraFeed /><div className="student-fields"><label>Họ tên học sinh<input value={student} onChange={event => setStudent(event.target.value)} placeholder="Nguyễn Văn A"/></label><label>Lớp<input value={studentClass} onChange={event => setStudentClass(event.target.value)} placeholder="11A1"/></label><div className="autosave">✓ Tự động lưu trên máy này</div></div>
    <div className="distance-picker"><span>1. Chọn khoảng cách thật</span><div>{rows.map(row => <button className={selected===row.distance?"active":""} onClick={() => selectDistance(row.distance)} key={row.distance}>{row.distance} cm {(row.simulated!==undefined||row.real!==undefined)&&<b>✓</b>}</button>)}</div></div>
    {mode === "simulation" ? <div className="measure-surface simulation-surface"><div className="camera-preview"><div className="preview-top"><span>● CAMERA MÔ PHỎNG</span><b>ID 0</b></div><div className="preview-stage"><div className="sim-tag" style={{transform:`rotate(${angle}deg) scale(${Math.max(.55,1.12-selected/180)})`,filter:`brightness(${light==="good"?1:light==="normal"?.76:.48})`}}>0</div><i className="bounding-box"/><div className="depth-line">z = {current?.simulated?.toFixed(3) || "—"} m</div></div></div><div className="controls"><h4>2. Điều chỉnh điều kiện</h4><label>Góc nghiêng <b>{angle}°</b><input type="range" min="0" max="60" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))}/></label><label>Ánh sáng<select value={light} onChange={event => setLight(event.target.value as Light)}><option value="good">Tốt</option><option value="normal">Trung bình</option><option value="dim">Thiếu sáng</option></select></label><label>TAG_SIZE (m)<input type="number" min="0.05" max="0.4" step="0.01" value={tagSize} onChange={event => setTagSize(Number(event.target.value))}/></label><small>TAG_SIZE đúng của thí nghiệm là 0,15 m. Hãy thử nhập sai để quan sát z_m thay đổi.</small><button className="primary measure-button" onClick={simulate}>⌖ Đo mô phỏng tại {selected} cm</button></div></div> : <div className="measure-surface real-surface"><div className="real-instructions"><span>THAO TÁC TRÊN JETBOT THẬT</span><ol><li>Dùng thước đặt tag cách camera đúng <b>{selected} cm</b>.</li><li>Giữ tag thẳng, đủ sáng và nằm trọn khung hình.</li><li>Đọc z_m, Hamming và Margin trên notebook Perception.</li><li>Nhập kết quả vào phiếu bên cạnh rồi bấm Lưu số liệu thật.</li></ol><div className="real-warning">Không kết nối điều khiển robot từ website. Số liệu được ghi từ notebook JetBot đã kiểm thử.</div></div><div className="real-form"><h4>Nhập số đo tại {selected} cm</h4><label>z_m đo được (m)<input inputMode="decimal" value={realZ} onChange={event => setRealZ(event.target.value)} placeholder="Ví dụ: 0.412"/></label><div className="field-row"><label>Hamming<input inputMode="numeric" value={realHamming} onChange={event => setRealHamming(event.target.value)}/></label><label>Margin<input inputMode="decimal" value={realMargin} onChange={event => setRealMargin(event.target.value)} placeholder="Ví dụ: 72"/></label></div><label>Ghi chú<input value={note} onChange={event => setNote(event.target.value)} placeholder="Ánh sáng, góc tag, hiện tượng..."/></label><button className="primary measure-button" onClick={saveReal}>✓ Lưu số liệu thật</button></div></div>}
    <div className="measurement-message" aria-live="polite">{message}</div>
    <div className="result-heading"><div><span>3. SO SÁNH KẾT QUẢ</span><h4>Bảng số liệu 40/60/80 cm</h4></div><div className="score-pills"><span>Mô phỏng <b>{simCount}/3</b></span><span>Số liệu thật <b>{realCount}/3</b></span><span>Đã so sánh <b>{comparisonCount}/3</b></span></div></div>
    <div className="table-scroll"><table className="measurement-table"><thead><tr><th>Khoảng cách thật</th><th>z_m mô phỏng</th><th>z_m JetBot thật</th><th>Sai số mô phỏng</th><th>Sai số thực</th><th>Chênh lệch hai chế độ</th><th>Nhận xét</th></tr></thead><tbody>{rows.map(row => {const simError=row.simulated===undefined?undefined:Math.abs(row.simulated-row.distance/100)*100;const realError=row.real===undefined?undefined:Math.abs(row.real-row.distance/100)*100;const diff=row.simulated===undefined||row.real===undefined?undefined:Math.abs(row.real-row.simulated)*100;return <tr key={row.distance}><td><b>{row.distance} cm</b></td><td>{row.simulated===undefined?"—":`${row.simulated.toFixed(3)} m`}<small>{row.simulatedMargin!==undefined?`H${row.simulatedHamming} · M${row.simulatedMargin}`:""}</small></td><td>{row.real===undefined?"—":`${row.real.toFixed(3)} m`}<small>{row.realMargin!==undefined?`H${row.realHamming} · M${row.realMargin}`:""}</small></td><td>{simError===undefined?"—":`${simError.toFixed(1)} cm`}</td><td>{realError===undefined?"—":`${realError.toFixed(1)} cm`}</td><td>{diff===undefined?"—":`${diff.toFixed(1)} cm`}</td><td><span className={realError===undefined?"status pending":realError<=2?"status good":realError<=5?"status warn":"status bad"}>{realError===undefined?"Chưa đo":realError<=2?"Tốt":realError<=5?"Chấp nhận":"Cần kiểm tra"}</span></td></tr>})}</tbody></table></div>
    <div className="lab-summary"><div><span>SAI SỐ THỰC TRUNG BÌNH</span><b>{realCount ? `${averageRealError.toFixed(1)} cm` : "—"}</b><small>{realCount===3 ? (averageRealError<=2?"Kết quả tốt":"Nên kiểm tra lại calibration và TAG_SIZE") : "Cần đủ ba mốc để kết luận"}</small></div><div className="export-actions"><button onClick={exportCsv} disabled={!simCount&&!realCount}>↓ Xuất CSV</button><button onClick={() => window.print()} disabled={!simCount&&!realCount}>▤ In / Lưu PDF</button><button onClick={reset}>↻ Làm lại</button><button className="primary" onClick={onComplete} disabled={simCount<3&&realCount<3}>Hoàn thành Bài 5 →</button></div></div>
  </section>;
}
