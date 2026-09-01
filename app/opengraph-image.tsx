import {ImageResponse} from "next/og";

export const alt = "PrintDrop — send photos and documents for printing";
export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",position:"relative",overflow:"hidden",background:"#f7f4ec",color:"#17201d",fontFamily:"Arial, sans-serif",padding:"68px 78px"}}>
      <div style={{position:"absolute",width:430,height:430,borderRadius:999,background:"#eadfbd",right:35,top:95,display:"flex"}} />
      <div style={{width:"57%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",fontSize:31,fontWeight:700}}>
          <div style={{width:52,height:52,borderRadius:15,background:"#1c6b4b",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:27,fontWeight:800,marginRight:16}}>P</div>
          PrintDrop
        </div>
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",color:"#1c6b4b",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:3,marginBottom:18}}>
            <div style={{width:32,height:3,background:"#1c6b4b",marginRight:12,display:"flex"}} />Easy file drop-off
          </div>
          <div style={{display:"flex",flexDirection:"column",fontSize:76,lineHeight:.95,letterSpacing:-4,fontWeight:700}}>
            <span>Send it.</span><span style={{color:"#1c6b4b"}}>We&apos;ll print it.</span>
          </div>
          <div style={{display:"flex",fontSize:24,lineHeight:1.45,color:"#69736f",marginTop:27,maxWidth:570}}>Upload photos and documents in seconds. No account needed.</div>
        </div>
        <div style={{display:"flex",alignItems:"center",fontSize:18,color:"#69736f"}}>
          <span style={{color:"#1c6b4b",marginRight:10}}>●</span>Private uploads&nbsp;&nbsp;·&nbsp;&nbsp;Print notes optional
        </div>
      </div>
      <div style={{width:"43%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <div style={{position:"absolute",width:330,height:390,borderRadius:16,background:"#c9ded0",border:"2px solid #b5ccbd",transform:"rotate(9deg)",right:5,top:72,display:"flex"}} />
        <div style={{position:"absolute",width:330,height:390,borderRadius:16,background:"#fff",border:"2px solid #deddd4",transform:"rotate(-4deg)",right:45,top:50,display:"flex",flexDirection:"column",padding:38,boxShadow:"0 20px 45px rgba(34,49,43,.16)"}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><div style={{width:90,height:12,borderRadius:8,background:"#1c6b4b",display:"flex"}}/><div style={{width:45,height:12,borderRadius:8,background:"#e5e7e2",display:"flex"}}/></div>
          <div style={{height:190,marginTop:34,background:"#f2c94c",display:"flex",alignItems:"center",justifyContent:"center",color:"#9d7720",fontSize:34,fontWeight:700,letterSpacing:4,borderRadius:5}}>FILE</div>
          <div style={{display:"flex",flexDirection:"column",marginTop:28}}><div style={{height:10,borderRadius:8,background:"#e8e8e4",display:"flex",marginBottom:11}}/><div style={{height:10,width:"78%",borderRadius:8,background:"#e8e8e4",display:"flex"}}/></div>
        </div>
        <div style={{position:"absolute",right:-18,bottom:47,padding:"18px 24px",borderRadius:14,background:"#1c6b4b",color:"white",display:"flex",flexDirection:"column",boxShadow:"0 14px 30px rgba(28,107,75,.24)"}}><span style={{fontSize:20,fontWeight:700}}>Ready to print</span><span style={{fontSize:14,opacity:.72,marginTop:3}}>Files arrive instantly</span></div>
      </div>
    </div>,
    {...size},
  );
}
