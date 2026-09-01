import Link from "next/link";
import {CircleGauge,Inbox,Printer} from "lucide-react";
import {Brand} from "@/components/brand";
import {SignOut} from "@/components/sign-out";
import {requireAdmin} from "@/lib/auth";
import "./admin.css";
export default async function AdminLayout({children}:LayoutProps<"/admin">){const user=await requireAdmin();return <div className="admin-shell"><aside className="sidebar"><Brand href="/admin"/><nav><Link href="/admin"><CircleGauge size={18}/>Overview</Link><Link href="/admin/entries"><Inbox size={18}/>Print entries</Link><Link href="/admin/layout/new"><Printer size={18}/>Layout studio</Link></nav><div className="side-user"><span>{(user.email??"A").slice(0,1).toUpperCase()}</span><div><strong>Print admin</strong><small>{user.email}</small></div></div><SignOut/></aside><main className="admin-main">{children}</main></div>}
