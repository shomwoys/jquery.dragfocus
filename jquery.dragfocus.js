;(function($){
	// https://jsfiddle.net/shomwoys/ff7o43a9/
	$.registerDragFocus = function(selector, context){
		$(context || document)
			.on('dragenter.draginout', selector, function(ev){
					var $this = $(this), cnt = $this.data('draginout') || 0;
					$this.data('draginout', cnt+1);
					if (cnt == 0) {
						$this
							.trigger({type:'dragin', target:this, originalEvent:ev.originalEvent})
							.trigger({type:'dragfocus',target:this, originalEvent:ev.originalEvent});
						setTimeout(function(){
							$this.parents().each(function(){
								var $p = $(this);
								if (($p.data('draginout')||0) > 0) {
									$p.trigger({type:'dragblur',target:this, originalEvent:ev.originalEvent});
								}
							});
						})
					}
			})
			.on('dragleave.draginout', selector, function(ev){
				var $this = $(this), cnt = $this.data('draginout');
				if (cnt === undefined) { throw new Error('invalid register dragenter'); }
				if (cnt == 1) {
						$this
							.trigger({type:'dragout', target:this, originalEvent:ev.originalEvent})
							.trigger({type:'dragblur', target:this, originalEvent:ev.originalEvent});
						setTimeout(function(){
							$this.parents().each(function(){
								var $p = $(this);
								if (($p.data('draginout')||0) > 0) {
									$p.trigger({type:'dragfocus', target:this, originalEvent:ev.originalEvent});
								}
							});
						});
				}
				$this.data('draginout', cnt-1);
			})
			.on('drop.draginput', selector, function(ev){
				$(this).parents().andSelf().each(function(){
					$(this).removeData('draginout');
				});
			});
	}
		
	$.unregisterDragFocus = function(selector, context){
		$(context || document)
			.off('dragenter.draginout dragleave.draginout', selector)
			.find(selector).removeData('datainout');
	};

})(jQuery);

function analyzeDataTransfer(dt){
	var ret = {
		is_files:false,
		is_urls:false,
		is_html:false,
		is_text:false,
		files:[],
		imgfiles:[], // cotent_type is in png,gif,jpeg,jpg
		urls:[], // raw urls or <a href> in html
		imgurls:[],	// url ext is in png,gif,jpeg,jpg or <img src> in html
		html:'',
		text:''
	};
	var file, html, text, url, imgfile, imgurl;
	var is_file = false; // dt.types has 'Files' but dt.getData('Files') is empty when ev.type = dragfocus
	dt.types.forEach(function(type){
		var data = dt.getData(type); // data is empty for dragenter and dragleave
		switch(type){
			case 'Files':
				ret.is_files = true;
				if (dt.files && dt.files[0]) {
					ret.files = Array.prototype.slice.call(dt.files);
					ret.files.forEach(function(file){
						if (file.type.match(/image\/(png|jpeg|jpg|gif)/)) {
							ret.imgfiles.push(file);
						}
					});
				}
				break;
			case 'text/html':
				ret.is_html = true;
				ret.html = data;
				break;
			case 'text/plain':
				ret.is_text = true;
				ret.text = data;
				break;
			case 'text/uri-list':
				ret.is_urls = true;
				if (data) {
					ret.urls = data.indexOf('\n') ? data.split('\n') : [data];
					ret.urls.forEach(function(url){
						if (url.match(/\.(png|jpg|jpeg|gif)(\?.*)?$/i)) {
							ret.imgurls.push(url);
						}
					})
				}
				break;
			default:
				ret[type] = data;
				break;
		}
	});
	if (ret.is_html && ret.html) {
		$('<div></div>').html(ret.html)
			.find('img[src]').each(function(){
				var src = $(this).attr('src');
				if (ret.imgurls.indexOf(src) < 0) {
					ret.imgurls.push($(this).attr('src'));
				}
			}).end()
	}
	return ret;
}
