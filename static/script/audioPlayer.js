/**
 * 音频播放器
 * https://passer-by.com/
 */

;(function (root, factory) {
    if (typeof define === 'function' && (define.amd||define.cmd)) {
        // AMD&CMD
        define(function(){
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root);
    } else {
        // Browser globals (root is window)
        root.audioPlayer = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    return function(element,param,callback){
        callback = callback || function(){};
        //对象定义
        var $this = element;
        var src = $this.getAttribute('data-src');
        var title = $this.getAttribute('data-title');
        var options = Object.assign({
            'prefix' : 'widget',    // 控件样式前缀
            'title':title,          // 音频标题
            'playlist':[src],       // 音频的播放列表
            'index':0,              // 默认播放的歌曲索引
            'autoplay':false,       // 是否自动播放
            'startTime': 0,         // 音频播放开始时间点
            'loop':false,           // 是否循环播放
            'preload':'meta',        // 是否预加载音频，meta确保在不加载音频流的情况下获取音频信息
            'onPlay':function(){},
            'onPause':function(){}
        },param);
        $this.innerHTML = '<div class="'+options.prefix+'-player">\
            <div class="'+options.prefix+'-title">'+options.title+'</div>\
            <div class="'+options.prefix+'-controls">\
                <div class="'+options.prefix+'-switch"></div>\
                <div class="'+options.prefix+'-progressSetting">\
                    <div class="'+options.prefix+'-currentTime">-</div>\
                    <div class="'+options.prefix+'-duration">-</div>\
                    <div class="'+options.prefix+'-progressBar">\
                        <div class="'+options.prefix+'-progress"></div>\
                    </div>\
                </div>\
                <div class="'+options.prefix+'-volumeSetting">\
                    <div class="'+options.prefix+'-volumeBox">\
                        <div class="'+options.prefix+'-volumeNumber"></div>\
                        <div class="'+options.prefix+'-volumeBar">\
                            <div class="'+options.prefix+'-volume"></div>\
                        </div>\
                    </div>\
                    <div class="'+options.prefix+'-voice"></div>\
                </div>\
            </div>\
        </div>';
        var $player = $this.getElementsByClassName(options.prefix+'-player')[0];
        var $switch = $this.getElementsByClassName(options.prefix+'-switch')[0];
        var $duration = $this.getElementsByClassName(options.prefix+'-duration')[0];
        var $currentTime = $this.getElementsByClassName(options.prefix+'-currentTime')[0];
        var $progressBar = $this.getElementsByClassName(options.prefix+'-progressBar')[0];
        var $progress = $this.getElementsByClassName(options.prefix+'-progress')[0];
        var $volumeSetting = $this.getElementsByClassName(options.prefix+'-volumeSetting')[0];
        var $volumeNumber = $this.getElementsByClassName(options.prefix+'-volumeNumber')[0];
        var $volumeBar = $this.getElementsByClassName(options.prefix+'-volumeBar')[0];
        var $volume = $this.getElementsByClassName(options.prefix+'-volume')[0];
        var $voice = $this.getElementsByClassName(options.prefix+'-voice')[0];
        var $audio =document.createElement("audio");
        //全局变量
        var _api = {};
        var _index = 0;  //当前播放歌曲在播放列表中的索引
        var _currentTime = "00:00";
        // 私有方法
        var prefixInteger = function(num,n){
            return (Array(n).join(0)+num).slice(-n);
        };
        var formatTime = function(s){
            return prefixInteger(Math.floor(s/60),2)+":"+prefixInteger(Math.floor(s%60),2);
        };
        var formatProgress = function(){
            $progress.style.width = $audio.currentTime/$audio.duration*100 + '%';
            $currentTime.innerHTML = formatTime($audio.currentTime);
            $duration.innerHTML = formatTime($audio.duration);
        };
        var formatVolume = function(){
            $volume.style.height = $audio.volume*100 + '%';
            $volumeNumber.innerHTML = Math.ceil($audio.volume*100);
        };
        var stopPropagation = function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = false;
            }
        };
        if ($audio != null && $audio.canPlayType && $audio.canPlayType("audio/mp3")){//如果成功创建audio对象
            $audio.src = options.playlist[options.index];
            $audio.preload = options.preload;
            $audio.loop = false; //屏蔽单曲循环
            $audio.currentTime = options.startTime;
            $player.appendChild($audio);
            if(options.autoplay){
                _api.play();
            }
            $switch.addEventListener("click",function(e){
                e.stopPropagation();
                ($audio.paused?_api.play:_api.pause)(); //通过播放状态判断是暂停还是播放
            }, false);
            //音频播放状态
            $audio.addEventListener('loadedmetadata',formatProgress);
            $audio.addEventListener('timeupdate',formatProgress);                 
            $audio.addEventListener('ended',function(){ //当音频播放结束
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
            $audio.addEventListener('volumechange',formatVolume);
        }
        // 公共方法
        _api.play = function(){ //播放
            $switch.classList.remove(options.prefix+'-switch-on');
            $switch.classList.add(options.prefix+'-switch-off');
            $audio.play();
            options.onPlay();
        };
        _api.pause = function(){ //暂定
            $switch.classList.remove(options.prefix+'-switch-off');
            $switch.classList.add(options.prefix+'-switch-on');
            $audio.pause();
            options.onPause();
        };
        _api.reset = function(){ //重置
            _index = 0;
            $audio.src = options.playlist[0];
            _api.pause();
        };
        // 事件绑定
        window.$audio = $audio;
        window.$volumeBar = $volumeBar;
        var isProgressSlide = false;
        var isVolumeSlide = false;
        var isVolumeShow = false;
        $progressBar.addEventListener('mousedown',function(event){
            isProgressSlide = true;
            var offsetX = event.offsetX;
            var width = this.clientWidth||this.offsetWidth;
            var progress = offsetX/width;
            $audio.currentTime = Math.ceil($audio.duration*progress);
        });
        $volumeBar.addEventListener('mousedown',function(event){
            isVolumeSlide = true;
            var offsetY = event.offsetY;
            var height = this.clientHeight||this.offsetHeight;
            var progress = offsetY/height;
            $audio.volume = progress;
        });
        $voice.addEventListener('click',function(event){
            if(isVolumeShow){
                $volumeSetting.classList.remove(options.prefix+'-volumeSetting-on');
                $volumeSetting.classList.add(options.prefix+'-volumeSetting-off');
            }else{
                $volumeSetting.classList.remove(options.prefix+'-volumeSetting-off');
                $volumeSetting.classList.add(options.prefix+'-volumeSetting-on');
            }
            isVolumeShow = !isVolumeShow;
            stopPropagation(event);
        });
        window.addEventListener('click',function(event){
            var className = event.target.className;
            if(isVolumeShow){        
                if(className.indexOf(options.prefix+'-volume')==-1){
                    $volumeSetting.classList.remove(options.prefix+'-volumeSetting-on');
                    $volumeSetting.classList.add(options.prefix+'-volumeSetting-off');
                    isVolumeShow = false;
                }
            }
        });
        window.addEventListener('mousemove',function(event){
            if(isProgressSlide){
                var width = $progressBar.clientWidth||$progressBar.offsetWidth;
                var offsetX = event.clientX-$progressBar.getClientRects()[0].x;
                var paddingLeft = parseFloat(window.getComputedStyle($progressBar)['padding-left']);
                var borderLeft = parseFloat(window.getComputedStyle($progressBar)['border-left-width']);
                offsetX -= (paddingLeft+borderLeft);
                offsetX = Math.max(0,offsetX);
                offsetX = Math.min(width,offsetX);
                var progress = offsetX/width;
                $audio.currentTime = Math.ceil($audio.duration*progress);
            }
            if(isVolumeSlide){
                var height = $volumeBar.clientHeight||$volumeBar.offsetHeight;
                var offsetY = $volumeBar.getClientRects()[0].y+height-event.clientY;
                var paddingTop = parseFloat(window.getComputedStyle($volumeBar)['padding-top']);
                var borderTop = parseFloat(window.getComputedStyle($volumeBar)['border-top-width']);
                offsetY += (paddingTop+borderTop);
                offsetY = Math.max(0,offsetY);
                offsetY = Math.min(height,offsetY);
                var progress = offsetY/height;
                $audio.volume = progress;
            }
        });
        window.addEventListener('mouseup',function(event){
            isProgressSlide = false;
            isVolumeSlide = false;
        });

        // 初始化
        formatVolume();
        _api.pause();
        callback(_api);
    };
}));