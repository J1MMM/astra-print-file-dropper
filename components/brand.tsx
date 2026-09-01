import Link from "next/link";
import { Files } from "lucide-react";
export function Brand({href="/"}:{href?:string}){return <Link className="brand" href={href}><span className="brand-mark"><Files size={18}/></span>PrintDrop</Link>}
