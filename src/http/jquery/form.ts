if (typeof jQuery != 'undefined')
{
	jQuery.fn.extend({
		query: function (callback: Function | string, failCallback?: Function, tipMask?: number) {
			if (tipMask == null && typeof failCallback == 'number')
			{
				tipMask = failCallback;
				failCallback = undefined;
			} else if (tipMask == null) { // default value
				tipMask = LP.http.TIP_MASK.ALERT_ALL
			}

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
							jQuery('<div style="position:absolute;left:' + (o!.left + $t.width()!) + 'px;top:' + (o!.top - 16) + 'px;height:32px;width:32px;display:block;z-index:99999" class="query-loading"><img style="width:32px;height:32px;" src="data:image/svg+xml;utf8,%3Csvg width=\'57\' height=\'57\' viewBox=\'0 0 57 57\' xmlns=\'http://www.w3.org/2000/svg\' stroke=\'#fff\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg transform=\'translate(1 1)\' stroke-width=\'2\'%3E%3Ccircle cx=\'5\' cy=\'50\' r=\'5\' stroke=\'#4285F4\'%3E%3Canimate attributeName=\'cy\' begin=\'0s\' dur=\'2.2s\' values=\'50;5;50;50\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3Canimate attributeName=\'cx\' begin=\'0s\' dur=\'2.2s\' values=\'5;27;49;5\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3C/circle%3E%3Ccircle cx=\'27\' cy=\'5\' r=\'5\' stroke=\'#DE3E35\'%3E%3Canimate attributeName=\'cy\' begin=\'0s\' dur=\'2.2s\' from=\'5\' to=\'5\' values=\'5;50;50;5\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3Canimate attributeName=\'cx\' begin=\'0s\' dur=\'2.2s\' from=\'27\' to=\'27\' values=\'27;49;5;27\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3C/circle%3E%3Ccircle cx=\'49\' cy=\'50\' r=\'5\' stroke=\'#F7C223\'%3E%3Canimate attributeName=\'cy\' begin=\'0s\' dur=\'2.2s\' values=\'50;50;5;50\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3Canimate attributeName=\'cx\' from=\'49\' to=\'49\' begin=\'0s\' dur=\'2.2s\' values=\'49;5;27;49\' calcMode=\'linear\' repeatCount=\'indefinite\' /%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E"></div>').appendTo('body');

						}); //disabled the submit button
						let data: JQuery.NameValuePair[] | FormData = $selector.serializeArray();
						let $files = jQuery('input[type="file"]:not([name=""])', $selector); // all files
						if ($selector.is('[enctype="multipart/form-data"]') || $files.length > 0)
						{
							let _formData = new FormData();
							data.forEach(v => _formData.append(v.name, v.value));
							$files.each(function() {
								jQuery.each((this as HTMLInputElement).files, (i, file) => _formData.append(jQuery(this).attr('name')!, file));
							});
							data = _formData;
						}

						return LP.http.jQueryAjax.getInstance().alertMask(tipMask!).request(method, url, data).then((json:any) => {
							if (typeof callback != 'undefined' && jQuery.isFunction(callback))
								return callback.call($this, json);
						}).catch(e => {
							if (typeof failCallback != 'undefined' && jQuery.isFunction(failCallback))
								return failCallback.call($this, e);
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
