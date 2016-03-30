jQuery dragfocus plugin
=======================

HTML5 `dragenter`, `dragleave` events are not comvenient.
This plugin add supports `dragin`, `dragout`, `dragfocus`, `dragblur` events for marking droppable area focusable.

- `dragin` : dragged into element
- `dragout` : dragged out of element
- `dragfocus` : focused for dropping
- `dragleave` : lost focus for dropping

`dragin` and `dragout` (like `mouseenter` and `mouseleave`) are fired when dragging object is dragged into/outof element from parent: NOT be fired with child elements.

`dragfocus` and `dragleave` are fired when dragging object into dragged into/outof **deepest** element: `dragfocus`ed element is unique in context.

You need to register droppable areas first.

	$.registerDropfocus('<selector>', [<context>])

Each events bubble up: when treat nested droppable area, the events need to be stopPropagation().

	$(document)
		.on('dragover drop', function(ev){
			// prevent default drop
			ev.preventDefault();
			ev.stopPropagation();
		})
		.on('dragout', 'body', function(){
			// drag canceled
			$('.dragfocus').removeClass('dragfocus');
		});
		.on('dragfocus dragblur drop', '.dropzone', function(ev){
			ev.preventDefault();
			// prevent bubble up to ancestor droppables
			ev.stopPropagation();
			var is_focus = ev.type == 'dragfocus';
			if (is_focus) {
				// focused
				$(this).addClass('dragfocus');
			} else {
				// blured or dropped
				$(this).removeClass('dragfocus');
			}
		})
		.on('drop', '.dropzone', function(ev){
			// on drop
			doSomething()
		});
