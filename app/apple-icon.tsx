import {ImageResponse} from "next/og";

export const size = {width: 180, height: 180};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#1c6b4b",borderRadius:38}}>
      <div style={{position:"relative",width:104,height:116,display:"flex"}}>
        <div style={{position:"absolute",left:27,top:0,width:72,height:92,border:"8px solid rgba(255,255,255,.58)",borderRadius:8}} />
        <div style={{position:"absolute",left:5,top:19,width:76,height:96,border:"8px solid white",borderRadius:8,display:"flex",flexDirection:"column",padding:"42px 14px 0"}}>
          <div style={{height:7,width:35,borderRadius:8,background:"white",marginBottom:10}} />
          <div style={{height:7,width:27,borderRadius:8,background:"white"}} />
        </div>
      </div>
    </div>,
    {...size},
  );
}
