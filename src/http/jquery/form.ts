if (jQuery)
{
	jQuery.fn.extend({
		query: function (callback: Function| string, autoTip: boolean = true) {

			return (this as JQuery).each(function() {

				let $this = jQuery(this);
				let is_form = $this.is('form');

				let on = $this.data('lp-query');
				if (on)
					$this.off(is_form ? 'submit' : 'click', on);

				if (callback == 'destroy') return;

				//bind
				let validator = is_form ? $this.data('validator') : null;
				if (validator) validator.settings.submitHandler = function (f: any, e: any) { };

				on = function (e: any) {
					if ($this.is('.disabled,[disabled]')) return false;

					let selector = $this.attr('selector') as string;

					let $selector = is_form ? $this.add(selector) : jQuery(selector);

					if (validator && !jQuery.isEmptyObject(validator.invalid)) //validator is invalid
						return false;

					if ((selector || is_form) && $selector.serializeArray().length <= 0) //selector is set,but nothing to query
					{
						LP.tip.toast(LP.QUERY_LANGUAGE.unselected);
						return false;
					}

					let url = $this.attr(is_form ? 'action' : 'href') as string,
						method = $this.attr('method') as string,
						msg = $this.attr('confirm');

					let query = function () {

						let $doms = is_form ? jQuery(':submit,:image', $this)/*.add($this)*/ : $this;
						$doms = $doms.filter(':not(.disabled,[disabled])');

						$doms.prop('disabled', true).attr('disabled', 'disabled').each(function(){

							let $t = jQuery(this),
								o = $t.offset();
							jQuery('<div style="position:absolute;left:' + (o!.left + $t.width()!) + 'px;top:' + (o!.top - 16) + 'px;height:16px;width:16px;display:block;z-index:99999" class="query-loading"><img src="data:image/gif;base64,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"</div>').appendTo('body');

						}); //disabled the submit button

						return (new LP.http.jQueryAjax()).setAutoTip(autoTip).request(method, url, $selector.serializeArray()).then(json => {

							if (typeof callback != 'undefined' && jQuery.isFunction(callback))
								callback.call($this, json);

						}).finally(() => {

							jQuery('.query-loading').remove();
							$doms.prop('disabled', false).removeAttr('disabled');

						});
					};

					if (msg) {

						msg = msg.replace('%L', $selector.serializeArray().length.toString());
						LP.tip.confirm(msg, query);

					} else
					{
						query();
					}

					e.stopImmediatePropagation();

					return false;
				};

				$this.on(is_form ? 'submit' : 'click', on).data({ 'lp-query': on });
			});
		}
	});
}
