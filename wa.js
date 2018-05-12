//ユーザーアクション実行必須
window.addEventListener('load',()=>{
	document.querySelector('button#start').addEventListener('click',main);	
});

//ユーザーアクション実行
const main=(e)=>{
	e.target.style.display='none';									//Startボタンを消し
	document.querySelector('#mainWindow').style.display='block';	//メイン画面表示
	
	const pBtn=document.querySelector('#play');						//Note On/Offボタン
	const oscType=document.querySelector('#oscType');				//波形選択
	const cstmWv=document.querySelector('#cstmWv');					//カスタム波形Window
	const cstmWvFrm=document.querySelector('#cstmWvFrm');			//カスタム波形調整スライダー
	const cstmWvFrmInit=document.querySelector('#cstmWvFrmInit');	//カスタム波形初期化ボタン
	const grLine=document.querySelector('#grLine');
	const grLine2=document.querySelector('#grLine2');
	const scopeBtn=document.querySelector('#scopeBtn');
	
	const context　=　new AudioContext();
	const analyser = context.createAnalyser();
	analyser.connect(context.destination);

	let osc;
	let stOnOff;
	let scopeFlg=true;
	//Note On/Off
	pBtn.addEventListener('click',()=>{
		stOnOff=pBtn.textContent;
		if(stOnOff=='NoteOn'){
			const vtype=Array.from(document.querySelectorAll(".oType")).filter( e => e.checked)[0].value;
			noteOn(vtype);
			pBtn.textContent="NoteOff";			
		}else{
			osc.stop();
			pBtn.textContent="NoteOn";
		}
	})
	
	//WaveType 変更
	oscType.addEventListener('change',e=>{
		const vtype=e.target.value;
		if(vtype=="custom") cstmWv.style.display='block'
		else cstmWv.style.display='none';
		noteReOn(vtype);
	});
	
	//CustomWave 調整
	cstmWvFrm.addEventListener('change',e=>{
		noteReOn('custom');
	});
	
	//CustomWaveInit
	cstmWvFrmInit.addEventListener('click',()=>{
		Array.from(cstmWvFrm.querySelectorAll("input"),(e,i)=>{
			if(i==0) e.value=100
			else e.value=50;
		});
		noteReOn('custom');
	});
	
	scopeBtn.addEventListener('click',()=>{
		if(scopeBtn.textContent=="stop"){
			scopeBtn.textContent='draw';
			scopeFlg=false;
		}else{
			scopeBtn.textContent='stop';
			scopeFlg=true;
			window.requestAnimationFrame(update);
		}
	});
	
	//Custom Wave生成
	const periodicWave=()=>{
		const img = new Float32Array(17);
		const rea = new Float32Array(17);
		img[0]=0;
		rea[0]=0;
		const lp=[rea,img];
		Array.from(cstmWvFrm.querySelectorAll('input'),(e,i)=>lp[i%2][Math.floor(i/2)+1]=(e.value-50)/50)
		osc.setPeriodicWave(context.createPeriodicWave(rea, img, {disableNormalization: true}));
	}
	
	//再生中、再生音をNote Off & 次の音をNote On
	const noteReOn=(vtype)=>{
		stOnOff=pBtn.textContent;
		if(stOnOff=="NoteOff"){
			osc.stop();
			noteOn(vtype);
		}
	}
	//Note On
	const noteOn=(vtype)=>{
		osc=oscillator=context.createOscillator();
		osc.frequency.value = 440;
		if(vtype=='custom'){
			periodicWave();
		}else{
			osc.type=vtype;
		}
		osc.connect(analyser);
		analyser.fftSize = 256;
		osc.start();
		draw();
	}

	const size={'width':400,'height':256};
	const draw=()=>{
		window.requestAnimationFrame(update);
	}
	const update = () => {
		const bufferLength = analyser.frequencyBinCount;
		let data = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(data);
//		analyser.getByteFrequencyData(data);
		let d = 'M';
		data.forEach((y, i) => {
			const x = i * (size.width / bufferLength);
			d += `${x} ${y},`;
		});
		grLine.setAttribute("d",d);

		let data2 = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(data2);
		d = 'M';
		data2.forEach((y, i) => {
			const x = i * (size.width / bufferLength);
			d += `${x} ${y},`;
		});
		grLine2.setAttribute("d",d);
		
		if (pBtn.textContent=="NoteOff") {
			if(scopeFlg) window.requestAnimationFrame(update);
		}
	}
	
}
