"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import MeasurementLab from "./measurement-lab";

type Lesson = {
  n: number; title: string; goal: string; steps: string[]; result: string; product: string;
  easy: string; teacherPrep: string; realRobot: string; commonError: string; fix: string;
  videoQuery?: string;
};

const lessons: Lesson[] = [
  { n:1, videoQuery:"AprilTag detection computer vision JetBot", title:"AprilTag là gì?", goal:"Nhận biết ID, tâm và bốn góc của AprilTag.", steps:["Đưa tag vào khung hình","Xoay tag 30°","Che 50% tag","Ghi nhận khi camera mất tag"], result:"Khung xanh xuất hiện khi nhận diện thành công.", product:"Bảng quan sát 4 thử nghiệm", easy:"AprilTag giống một cột mốc có số riêng. Camera dùng viền, bốn góc và mẫu ở giữa để biết tag nào đang xuất hiện, nằm lệch bên nào và xa hay gần.", teacherPrep:"In AprilTag ID 0–3, dán lên bìa cứng; chuẩn bị máy chiếu. Bài này chưa cần JetBot thật.", realRobot:"Trên JetBot thật, camera cần thấy trọn tag, đủ sáng và không bị rung để đọc ID ổn định.", commonError:"Nhầm AprilTag với QR code hoặc chưa hình dung z_m.", fix:"Nhắc lại: QR ưu tiên chứa nội dung; AprilTag ưu tiên định vị. z_m là khoảng cách tiến thẳng từ camera đến tag." },
  { n:2, videoQuery:"NVIDIA JetBot camera setup JupyterLab", title:"Mở camera JetBot", goal:"Biết camera là mắt của robot và mở đúng quy trình.", steps:["Kiểm tra JetBot đã bật","Kiểm tra cùng Wi‑Fi","Mở JupyterLab","Shut Down All Kernels","Bật camera"], result:"Video có nhãn LIVE màu xanh và ổn định.", product:"Ảnh camera live và IP JetBot", easy:"Một camera chỉ nên được một notebook dùng tại một thời điểm. Tắt kernel cũ trước khi mở camera giúp tránh tình trạng camera bị chiếm.", teacherPrep:"Reboot JetBot, ghi sẵn IP từng xe và mở thử notebook camera trước khi học sinh vào lớp.", realRobot:"Kết thúc bài thật bằng cleanup: ngắt liên kết video nếu có và chạy camera.stop().", commonError:"Device busy, không có hình hoặc camera khởi tạo thất bại.", fix:"Shut Down All Kernels → chạy lại từ cell đầu → kiểm tra IP, Wi‑Fi và dây CSI → reboot nếu vẫn chưa được." },
  { n:3, videoQuery:"camera calibration checkerboard OpenCV JetBot", title:"Hiệu chỉnh camera", goal:"Tạo kết quả calibration tin cậy từ ảnh checkerboard.", steps:["Đặt bảng ở giữa","Chụp các mép ảnh","Chụp gần và xa","Chụp nghiêng","Đủ 10 ảnh khác nhau"], result:"RMS dưới 1,0 px là tốt.", product:"camera_calibration.json và bảng góc chụp", easy:"Ống kính làm méo ảnh ở rìa. Chụp checkerboard ở nhiều vị trí giúp tạo một 'thước đo' riêng cho camera.", teacherPrep:"Chuẩn bị checkerboard 11 × 8 ô, dán phẳng. Trong code phải dùng số góc trong (10, 7).", realRobot:"Mỗi camera cần file calibration riêng; không lấy file của JetBot khác dùng thay.", commonError:"Không thấy checkerboard, RMS cao hoặc đếm nhầm số ô.", fix:"Làm phẳng bảng, tăng sáng và chụp lại 10–15 góc thật khác nhau: giữa, mép, nghiêng, gần, xa." },
  { n:4, title:"Kiểm tra calibration", goal:"So sánh ảnh trước và sau khi khử méo.", steps:["Kéo thanh so sánh","Quan sát rìa ảnh","Chọn nhận xét đúng","Kiểm tra RMS","Quyết định dùng kết quả"], result:"Các đường thẳng ở rìa bớt cong.", product:"Ảnh verify_undistorted.jpg và ghi chú", easy:"Ảnh giữa thường thay đổi ít; cạnh bàn, tường và lưới ở rìa cho thấy rõ calibration có sửa méo tốt hay không.", teacherPrep:"Kiểm tra camera_calibration.json của từng nhóm và chuẩn bị checkerboard dự phòng.", realRobot:"Nếu RMS trên 2,0 px hoặc đường rìa vẫn cong nhiều, quay lại Bài 3 trước khi đo tag.", commonError:"Không có JSON, verify không chạy hoặc RMS quá cao.", fix:"Mở đúng thư mục notebook → giải phóng camera → chạy verify từ đầu; nếu RMS cao thì chụp lại bộ calibration." },
  { n:5, title:"Nhận diện AprilTag", goal:"Đọc khoảng cách z_m và đánh giá chất lượng nhận diện.", steps:["Đo ở 40 cm","Đo ở 60 cm","Đo ở 80 cm","Thử TAG_SIZE sai"], result:"Bảng đo có sai số cho từng khoảng cách.", product:"Bảng đo 40/60/80 cm và ảnh bounding box", easy:"ID là số hiệu; x_m là lệch trái-phải; z_m là khoảng cách. Hamming càng thấp và Margin càng cao thì kết quả thường càng đáng tin.", teacherPrep:"Chuẩn bị tag36h11, thước đo, ánh sáng ổn định và notebook Perception đã kiểm thử.", realRobot:"TAG_SIZE phải là cạnh thật của tag tính bằng mét. 15 cm phải nhập 0.15.", commonError:"Không detect, z_m sai hoặc ID thay đổi liên tục.", fix:"Kiểm tra family/ID, ánh sáng và tag nằm trọn khung. Đo lại TAG_SIZE và dùng đúng file calibration của JetBot." },
  { n:6, title:"Điều hướng đến một tag", goal:"Cho robot tìm ID 1 và dừng cách tag 0,30 m.", steps:["Kiểm tra an toàn","Bắt đầu quét","Tìm thấy ID 1","Căn giữa và tiến tới","Ghi kết quả 3 lần"], result:"Robot dừng trong vùng 0,30 m ± sai số.", product:"Ba lần đo khoảng cách dừng", easy:"Robot làm hai việc: scan để xoay tìm đúng ID, rồi approach để căn theo x_m và tiến đến khi z_m đạt khoảng cách dừng.", teacherPrep:"Dọn vùng 1,5 m × 1,5 m, dựng chắc tag ID 1, mở sẵn lệnh robot.stop() và luôn có người quan sát.", realRobot:"Chỉ chạy notebook Navigation gốc đã kiểm thử; lần đầu dùng tốc độ thấp và không để người đứng trước đường chạy.", commonError:"Robot không chạy, scan timeout hoặc vượt quá tag.", fix:"Dừng robot trước. Kiểm tra motor/ID/ánh sáng; nếu vượt đích, giảm tốc và kiểm tra TAG_SIZE cùng calibration." },
  { n:7, title:"Điều hướng hai tag", goal:"Hoàn thành chuỗi ID 1 rồi ID 2.", steps:["Kiểm tra pipeline","Tìm ID 1","Đến ID 1","Tìm ID 2","Đến ID 2"], result:"Pipeline sáng lần lượt từ Calibration đến Hoàn thành.", product:"Bảng tinh chỉnh và minh chứng ID 1 → ID 2", easy:"Sau khi đến ID 1, robot phải ổn định rồi mới quét ID 2. Mỗi lần chỉ đổi một tham số để biết chính xác điều gì làm kết quả thay đổi.", teacherPrep:"Đặt hai tag cách nhau trên 1 m trong vùng rộng hơn 2 m × 2 m; chuẩn bị bảng ghi số liệu.", realRobot:"Tốc độ cao dễ vượt đích; tolerance nhỏ dừng sát hơn nhưng cần căn chỉnh lâu hơn.", commonError:"Không thấy tag 2, xoay giật hoặc dừng lệch 0,30 m.", fix:"Đưa tag vào vùng quét, giảm turn_speed hoặc tăng center_margin. Đo ba lần trước khi đổi tiếp tham số." }
];

const icons = ["◈","◉","▦","↔","⌖","➜","⇢"];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [lesson, setLesson] = useState(0);
  const [step, setStep] = useState(0);
  const [teacher, setTeacher] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [camera, setCamera] = useState(false);
  const [calibration, setCalibration] = useState(false);
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(1.1);
  const [runs, setRuns] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("jetbot-progress");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setStarted(Boolean(data.started));
      setLesson(Math.min(6, data.lesson || 0));
      setRuns(data.runs || 0);
    } catch { localStorage.removeItem("jetbot-progress"); }
  }, []);
  useEffect(() => { localStorage.setItem("jetbot-progress", JSON.stringify({started,lesson,runs})); }, [started,lesson,runs]);

  const current = lessons[lesson];
  const completed = lesson + (step === current.steps.length ? 1 : 0);
  const next = () => {
    if (step < current.steps.length - 1) { setStep(step + 1); setNotice("Đúng rồi! Bây giờ hãy làm bước tiếp theo."); return; }
    setNotice("Bạn đã hoàn thành bài học này!");
    if (lesson < 6) { setLesson(lesson + 1); setStep(0); }
  };
  const startRobot = () => {
    if (!camera || !calibration) { setNotice(!camera ? "Camera chưa bật. Hãy bấm Bật camera trước." : "Calibration chưa đạt. Hãy xác nhận kết quả calibration trước."); return; }
    setRunning(true); setDistance(1.1); setNotice("Đang quét tìm ID 1…");
  };
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setDistance(value => {
      if (value <= .3) { window.clearInterval(id); setRunning(false); setRuns(count => count + 1); setNotice("Đã dừng an toàn ở 0,30 m. Hãy ghi kết quả lần chạy này."); return .3; }
      if (value < .85) setNotice("Đã tìm thấy ID 1 — robot đang căn giữa và tiến tới.");
      return +(value - .08).toFixed(2);
    }), 700);
    return () => window.clearInterval(id);
  }, [running]);

  const simulator = useMemo(() => lesson === 4 ? <MeasurementLab onComplete={next}/> : lesson === 5 ? (
    <Robot camera={camera} calibration={calibration} running={running} distance={distance}
      onCamera={() => {setCamera(true);setNotice("Camera đã bật — LIVE. Bạn có thể bắt đầu mô phỏng.");}}
      onCalibration={() => {setCalibration(true);setNotice("Calibration đạt: RMS 0,62 px.");}}
      onRun={startRobot} onStop={() => {setRunning(false);setNotice("Robot đã dừng khẩn cấp ngay lập tức.");}} runs={runs}/>
  ) : <LearningVisual lesson={current} step={step} onAction={next}/>, [lesson,step,camera,calibration,running,distance,runs,current]);

  if (!started) return (
    <main className="landing">
      <nav><span className="logo">JETBOT <i>LAB</i></span><div className="nav-actions"><button className="textbtn" onClick={() => setShowHandbook(true)}>▤ Mở sổ tay</button><button className="textbtn" onClick={() => setTeacher(!teacher)}>▣ Chế độ giáo viên</button></div></nav>
      <section className="hero"><div><p className="eyebrow">PHÒNG THÍ NGHIỆM TRỰC TUYẾN · LỚP 11</p><h1>Phòng thực hành <em>AprilTag</em> với JetBot</h1><p className="lead">Học cách robot nhìn thấy AprilTag, đo khoảng cách và tự di chuyển đến mục tiêu.</p><div className="hero-actions"><button className="primary" onClick={() => setStarted(true)}>Bắt đầu thực hành <b>→</b></button><button className="secondary" onClick={() => setStarted(true)}>Chọn bài</button></div><p className="tiny">⏱ Khoảng 70 phút · 7 bài thực hành · Không cần camera thật</p></div><div className="hero-photo"><Image src="/handbook/tong-quan.png" alt="Mô hình JetBot, camera, AprilTag, checkerboard và máy tính" fill sizes="(max-width: 900px) 100vw, 430px" priority/></div></section>
      <section className="pathintro"><div><strong>0 / 7 bài</strong><span>Tiến độ của bạn</span></div><div className="progress"><i/></div><button className="guide" onClick={() => setShowHandbook(true)}>▤ Sổ tay trực quan cho HS & GV</button></section>
      <section className="handbook-intro"><Image src="/handbook/quy-trinh-cot-loi.png" alt="Ba thao tác cốt lõi: hiệu chỉnh, nhận diện và điều hướng" width={1700} height={900}/><div><p className="eyebrow dark">SỔ TAY ĐÃ ĐƯỢC TÍCH HỢP</p><h2>Nhìn quy trình trước, thực hành từng bước sau</h2><p>Mỗi bài có hình minh họa, giải thích dễ hiểu, liên hệ JetBot thật, lỗi thường gặp và ghi chú riêng cho giáo viên.</p><div className="download-row"><a className="primary linkbutton" href="/handbook/so-tay-apriltag-jetbot.pdf" target="_blank" rel="noreferrer">Xem toàn bộ sổ tay</a><a href="/handbook/so-tay-apriltag-jetbot.docx" download>Tải bản Word</a></div></div></section>
      {teacher && <aside className="teacher"><b>Chế độ giáo viên</b><span>Bạn có thể mở khóa mọi bài và xem phần chuẩn bị, an toàn, xử lý lỗi trong sổ tay.</span><button onClick={() => setStarted(true)}>Mở bảng điều khiển</button></aside>}
      {showHandbook && <HandbookPanel lesson={current} teacher={teacher} onClose={() => setShowHandbook(false)}/>} 
    </main>
  );

  return (
    <main className="app">
      <header><button className="logo" onClick={() => setStarted(false)}>JETBOT <i>LAB</i></button><div className="top-progress"><span>Tiến độ</span><div><i style={{width:`${Math.max(8,completed/7*100)}%`}}/></div><b>{completed}/7 bài</b></div><div className="nav-actions"><button className="textbtn handbook-button" onClick={() => setShowHandbook(true)}>▤ Sổ tay bài {current.n}</button><button className={teacher ? "textbtn teacher-on" : "textbtn"} onClick={() => setTeacher(!teacher)}>▣ Giáo viên</button></div></header>
      <div className="body">
        <aside className="sidebar"><p>HÀNH TRÌNH HỌC</p>{lessons.map((item,index) => <button key={item.n} className={index===lesson?"lesson active":index<lesson||teacher?"lesson unlocked":"lesson locked"} disabled={index>lesson&&!teacher} onClick={() => {setLesson(index);setStep(0);setNotice("");}}><span>{icons[index]}</span><div><b>Bài {item.n}</b><small>{item.title}</small></div>{index<lesson&&<em>✓</em>}</button>)}<button className="reset" onClick={() => {localStorage.removeItem("jetbot-progress");setLesson(0);setStep(0);setRuns(0);setNotice("Đã đặt lại tiến độ trên máy này.");}}>↻ Đặt lại tiến độ</button></aside>
        <section className="workspace"><div className="crumb">Bài {current.n} <span>/</span> {current.title}</div><h2>{current.title}</h2><p className="lesson-goal">{current.goal}</p>{teacher && <div className="teacher-strip"><b>Gợi ý giảng bài:</b> {current.teacherPrep}</div>}{simulator}{notice&&<div className="notice">✓ {notice}</div>}</section>
        <aside className="guidepanel"><div className="guide-title"><span>Bước {step+1}/{current.steps.length}</span><div>{current.steps.map((_,index) => <i className={index<step?"done":index===step?"now":""} key={index}/>)}</div></div><div className="step-thumbs" aria-label="Chọn bước"><span>CHỌN HÌNH MINH HỌA</span><div>{current.steps.map((item,index) => <button key={item} className={index===step?"step-thumb active":"step-thumb"} onClick={() => {setStep(index);setNotice("");}}><b>{index+1}</b><small>{item}</small></button>)}</div></div><h3>{current.steps[step]}</h3><Guide icon="◎" label="Mục tiêu" text={current.goal}/><Guide icon="☝" label="Bạn cần làm" text={`Bấm nút đang sáng để: ${current.steps[step]}.`}/><Guide icon="✓" label="Kết quả cần thấy" text={current.result}/><Guide icon="↗" label="Trên JetBot thật" text={current.realRobot}/><div className="errorbox"><b>Gặp lỗi?</b><p>{current.commonError}</p><button onClick={() => setShowHandbook(true)}>Xem nguyên nhân và cách sửa</button></div><div className="submit"><small>SẢN PHẨM CẦN NỘP</small><b>{current.product}</b></div>{lesson!==5&&<button className="primary full" onClick={next}>{step===current.steps.length-1?"Hoàn thành bước này":"Bấm để tiếp tục"} <b>→</b></button>}</aside>
      </div>
      {showHandbook && <HandbookPanel lesson={current} teacher={teacher} onClose={() => setShowHandbook(false)}/>} 
    </main>
  );
}

function Guide({icon,label,text}:{icon:string;label:string;text:string}) { return <div className="guideitem"><span>{icon}</span><div><b>{label}</b><p>{text}</p></div></div>; }

function StepVisual({lesson,step}:{lesson:Lesson;step:number}) {
  const kind = ["frame","rotate","block","camera","record"][step % 5];
  return <div className={`step-visual visual-${kind}`} aria-label={`Minh họa riêng cho bước ${step + 1}`}><div className="visual-grid"/><div className="visual-device"><div className="device-screen"><div className="device-top"/><div className="device-content"><span className="device-dot"/><span/><span/><span/></div></div><div className="device-base"/></div><div className="visual-tag"><b>{lesson.n === 1 ? "0" : lesson.n === 2 ? "CAM" : "36h11"}</b></div><div className="visual-arrow">→</div><div className="visual-state"><strong>{step === 0 ? "SẴN SÀNG" : step === 1 ? "KIỂM TRA" : step === 2 ? "PHẢN HỒI" : step === 3 ? "XÁC NHẬN" : "GHI LẠI"}</strong><span>{lesson.steps[step]}</span></div><div className="visual-counter">{step + 1} / {lesson.steps.length}</div></div>;
}

function LearningVisual({lesson,step,onAction}:{lesson:Lesson;step:number;onAction:()=>void}) {
  return <div className="visual handbook-visual"><div className="visual-label"><span>MINH HỌA BƯỚC {step + 1} · {lesson.title}</span><button onClick={() => window.open("/handbook/so-tay-apriltag-jetbot.pdf","_blank")}>Sổ tay ↗</button></div><StepVisual lesson={lesson} step={step}/><div className="video-guide"><div><span>VIDEO HƯỚNG DẪN TỪ YOUTUBE</span><p>Xem thao tác mẫu, sau đó tự thực hiện lại trong mô phỏng. Video chỉ là hướng dẫn, không thay thế checkpoint.</p></div><iframe title={`Video hướng dẫn Bài ${lesson.n}`} src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(lesson.videoQuery || `${lesson.title} JetBot`)}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div><div className="easy-explain"><span>GIẢI THÍCH DỄ HIỂU</span><p>{lesson.easy}</p></div><div className="scene-bottom"><span>Bước đang làm: <b>{lesson.steps[step]}</b></span><button className="primary" onClick={onAction}>Đã quan sát, tiếp tục <b>→</b></button></div></div>;
}

function Robot({camera,calibration,running,distance,onCamera,onCalibration,onRun,onStop,runs}:{camera:boolean;calibration:boolean;running:boolean;distance:number;onCamera:()=>void;onCalibration:()=>void;onRun:()=>void;onStop:()=>void;runs:number}) {
  return <><div className="lesson6-illustration"><div><span>QUY TRÌNH TRÊN JETBOT THẬT</span><p>Vùng an toàn → sẵn nút dừng → scan → căn giữa → đo khoảng cách dừng.</p></div><Image src="/handbook/bai-6.png" alt="Quy trình trực quan điều hướng JetBot đến một AprilTag" width={1770} height={890}/></div><div className="robotlab"><div className="safety"><b>✓ Checklist an toàn</b><label><input type="checkbox" checked={camera} onChange={onCamera}/> Camera đã bật</label><label><input type="checkbox" checked={calibration} onChange={onCalibration}/> Calibration đạt</label><label><input type="checkbox" checked readOnly/> Vùng chạy an toàn</label></div><div className="arena"><div className="arenahead"><span className={camera?"live":"offline"}>● {camera?"LIVE":"CAMERA TẮT"}</span><span>{running?"Đang chạy mô phỏng":"Sẵn sàng"}</span></div><div className="field"><div className="tag target">ID<br/><b>1</b></div><div className="measure">{distance.toFixed(2)} m</div><div className="roboticon" style={{left:`${Math.max(15,85-distance*48)}%`}}>●<small>JetBot</small></div></div><div className="pipeline">{["Calibration","Perception","Scan ID 1","Approach","Hoàn thành"].map((item,index)=><span className={(running&&index<4)||(!running&&runs>0&&index===4)?"lit":""} key={item}>{item}</span>)}</div></div><div className="robot-actions"><button className={!camera?"primary pulse":"secondary"} onClick={onCamera}>1. Bật camera</button><button className={!calibration?"primary pulse":"secondary"} onClick={onCalibration}>2. Xác nhận calibration</button><button className={camera&&calibration&&!running?"primary pulse":"secondary"} onClick={onRun} disabled={running}>3. Bắt đầu quét</button><button className="danger" onClick={onStop}>■ Dừng khẩn cấp</button></div><div className="runs">Lần chạy đã ghi: <b>{runs}/3</b> <span>{runs>=3?"✓ Đủ điều kiện hoàn thành":"Cần thực hiện thêm để hoàn thành Bài 6"}</span></div></div></>;
}

function HandbookPanel({lesson,teacher,onClose}:{lesson:Lesson;teacher:boolean;onClose:()=>void}) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => {if(event.currentTarget===event.target) onClose();}}><section className="handbook-modal" role="dialog" aria-modal="true" aria-label={`Sổ tay Bài ${lesson.n}`}><header><div><span>SỔ TAY TRỰC QUAN · BÀI {lesson.n}</span><h2>{lesson.title}</h2></div><button aria-label="Đóng sổ tay" onClick={onClose}>×</button></header><div className="modal-body"><div className="modal-image"><Image src={`/handbook/bai-${lesson.n}.png`} alt={`Minh họa sổ tay Bài ${lesson.n}`} fill sizes="(max-width: 800px) 100vw, 640px"/></div><div className="handbook-cards"><article className="student-card"><span>DÀNH CHO HỌC SINH</span><h3>Hiểu nhanh trước khi làm</h3><p>{lesson.easy}</p><h4>Em cần tạo ra</h4><p>{lesson.product}</p></article><article className="robot-card"><span>LIÊN HỆ JETBOT THẬT</span><p>{lesson.realRobot}</p></article><article className="trouble-card"><span>NẾU GẶP LỖI</span><h4>{lesson.commonError}</h4><p>{lesson.fix}</p></article>{teacher&&<article className="teacher-card"><span>DÀNH CHO GIÁO VIÊN</span><h3>Chuẩn bị và gợi ý triển khai</h3><p>{lesson.teacherPrep}</p><p className="safety-note"><b>An toàn:</b> Chỉ dùng notebook gốc đã kiểm thử. Khi robot chạy phải có người quan sát và sẵn lệnh dừng.</p></article>}</div></div><footer><div><a href="/handbook/so-tay-apriltag-jetbot.pdf" target="_blank" rel="noreferrer">Xem PDF 23 trang ↗</a><a href="/handbook/so-tay-apriltag-jetbot.docx" download>Tải bản Word</a></div><button className="primary" onClick={onClose}>Quay lại thực hành</button></footer></section></div>;
}
