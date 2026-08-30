import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JETBOT LAB · Phòng thực hành AprilTag",
  description: "Phòng thí nghiệm tương tác giúp học sinh lớp 11 khám phá thị giác máy tính và điều hướng JetBot.",
};

export const viewport: Viewport = {
  themeColor: "#071522",
  userScalable: true,
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" className="bg-background"><body>{children}</body></html>;
}
