import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Phòng thực hành AprilTag với JetBot", description: "Học cách robot nhìn thấy AprilTag, đo khoảng cách và tự di chuyển đến mục tiêu." };
export default function Layout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="vi"><body>{children}</body></html>; }
