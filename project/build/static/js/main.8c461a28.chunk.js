(this.webpackJsonpproject=this.webpackJsonpproject||[]).push([[0],{33:function(e,t,n){e.exports=n(71)},67:function(e,t){},70:function(e,t,n){},71:function(e,t,n){"use strict";n.r(t);var c=n(0),o=n.n(c),r=n(27),a=n.n(r),i=n(28),s=n(29),f=n(31),l=n(32),u=n(30),d=n.n(u),m=(n(70),function(e){Object(l.a)(n,e);var t=Object(f.a)(n);function n(e){var c;return Object(i.a)(this,n),(c=t.call(this,e)).sendToPeer=function(e,t){c.socket.emit(e,{socketID:c.socket.id,payload:t})},c.createOffer=function(){console.log("Offer"),c.pc.createOffer({offerToReceiveVideo:1}).then((function(e){c.pc.setLocalDescription(e),c.sendToPeer("offerOrAnswer",e)}),(function(e){}))},c.createAnswer=function(){console.log("Answer"),c.pc.createAnswer({offerToReceiveVideo:1}).then((function(e){c.pc.setLocalDescription(e),c.sendToPeer("offerOrAnswer",e)}),(function(e){}))},c.localVideoRef=o.a.createRef(),c.remoteVideoRef=o.a.createRef(),c.socket=null,c.candidates=[],c}return Object(s.a)(n,[{key:"componentDidMount",value:function(){var e=this;this.socket=d()("/webrtcPeer",{path:"/webrtc",query:{}}),this.socket.on("connection-success",(function(e){console.log(e)})),this.socket.on("offerOrAnswer",(function(t){e.textref.value=JSON.stringify(t),e.pc.setRemoteDescription(new RTCSessionDescription(t))})),this.socket.on("candidate",(function(t){e.pc.addCandidate(new RTCIceCandidate(t))}));this.pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]}),this.pc.onicecandidate=function(t){t.candidate&&e.sendToPeer("candidate",t.candidate)},this.pc.onconnectionstatechange=function(e){console.log(e)},this.pc.onaddstream=function(t){e.remoteVideoRef.current.srcObject=t.stream};navigator.mediaDevices.getUserMedia({video:!0}).then((function(t){window.localStream=t,e.localVideoRef.current.srcObject=t,e.pc.addStream(t)})).catch((function(e){console.log("getUserMedia Error:",e)}))}},{key:"render",value:function(){var e=this;return o.a.createElement("div",{className:"stream"},o.a.createElement("h1",null,"WebRTC"),o.a.createElement("video",{ref:this.localVideoRef,autoPlay:!0}),o.a.createElement("video",{ref:this.remoteVideoRef,autoPlay:!0}),o.a.createElement("br",null),o.a.createElement("button",{onClick:this.createOffer},"Offer"),o.a.createElement("button",{onClick:this.createAnswer},"Answer"),o.a.createElement("br",null),o.a.createElement("textarea",{ref:function(t){return e.textref=t}}),o.a.createElement("br",null))}}]),n}(o.a.Component));a.a.render(o.a.createElement(m,null),document.getElementById("root"))}},[[33,1,2]]]);
//# sourceMappingURL=main.8c461a28.chunk.js.map