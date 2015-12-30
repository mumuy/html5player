/*
	简易html5音频播放器 v1.0
	BY:le
*/
function html5player(id,param,callback){
	callback = callback || function(){};
	var defaults = {
		'panel' : {
			'switch' : 'switch',					//播放与暂停按键的id
			'duration': 'duration',				//音频播放总播放时长显示的id
			'currentTime': 'currentTime',		//控件对象：音频播放当前时间点显示
			'progress':'progress'				//时间轴
		},
		'playlist':[],			//音频的播放列表
		'index':0,				//默认播放的歌曲索引
		'autoplay':false,		//是否自动播放
		'startTime': 0,			//音频播放开始时间点
		'loop':false,			//是否循环播放
		'preload':'meta',		//是否预加载音频，meta确保在不加载音频流的情况下获取音频信息
	}
	var options = extend(defaults,param);
	//对象定义
	var $player = $(id);
	var $switch = $(options.panel.switch);
	var $duration = $(options.panel.duration);
	var $currentTime = $(options.panel.currentTime);
	var $progress = $(options.panel.progress);
	var $played = $progress.firstChild;
	var $audio =document.createElement("audio"); //audio对象
	//全局变量
	var _api = {};
	var _index = 0;  //当前播放歌曲在播放列表中的索引
	var _currentTime = "00:00";
	if ($audio != null && $audio.canPlayType && $audio.canPlayType("audio/mpeg")){//如果成功创建audio对象
		$audio.src = options.playlist[options.index];
		$audio.preload = options.preload;
		$audio.loop = false; //屏蔽单曲循环
		$audio.startTime = options.startTime;
		$player.appendChild($audio);
		if(options.autoplay){
			_api.play();
		}
		$switch.addEventListener("click",function(e){
			e.stopPropagation();
			($audio.paused?_api.play:_api.pause)(); //通过播放状态判断是暂停还是播放
		}, false);
		//音频播放状态
		$audio.addEventListener("loadedmetadata", function(){ //当音频元数据已加载时
			$played.style.width = $audio.startTime/$audio.duration*100 + '%';
			$currentTime.innerHTML = formatTime($audio.startTime);
			$duration.innerHTML = formatTime($audio.duration);
		});
		$audio.addEventListener("timeupdate",function(){ //当前播放位置更新
			$played.style.width = $audio.currentTime/$audio.duration*100 + '%';
			$currentTime.innerHTML = formatTime($audio.currentTime);
		});					
		$audio.addEventListener("ended", function(){ //当音频播放结束
			if(options.loop){
				_index = (_index + 1)%options.playlist.length;
				$audio.src = options.playlist[_index];
				_api.play();
			}else{
				_index ++;
				if(_index<options.playlist.length){
					$audio.src = options.playlist[_index];
					_api.play();
				}else{
					_api.reset();
				}
			}
		});
	}
	//私有方法
	_api.play = function(){ //播放
		$switch.classList.remove('status-play');
		$switch.classList.add('status-pause');
		$audio.play();
	};
	_api.pause = function(){ //暂定
		$switch.classList.remove('status-pause');
		$switch.classList.add('status-play');
		$audio.pause();
	};
	_api.reset = function(){ //重置
		_index = 0;
		$audio.src = options.playlist[0];
		_api.pause();
	}
	callback(_api);
	//私有工具函数
	function $(id){	//获取指定id的DOM对象
		return document.getElementById(id);
	}
	function extend(target, source) { //深度合并两个对象
		for (var p in source) {
			if (source.hasOwnProperty(p)) {
				if(typeof target[p]=="object"){
					target[p] = extend(target[p],source[p]);
				}else{
					target[p] = source[p];
				}
			}
		}
		return target;
	}
	function p(s) {	//补0
		return ~~s < 10 ? '0' + s: s;
	}
	function formatTime(s){ //格式化时间
		return p(Math.floor(s/60))+":"+p(Math.floor(s%60));
	}
}