
/* jQuery Prism Plug-in
 * Version 0.1
 * Written by Steven Hunt
 */

(function ($) {

    $.widget("ui.prism", {

        options: {
            url: "",                //Url of the jQuery share-compatible web service.
            channel: "default",     //Name of the channel to connect to.
            token: "none",          //Token to use when connecting to the channel.
            callOnSend: true,       //Indicates that the jquery function called should automatically be called on the local webpage.
            mode: 'poll',
            onSend: false,
            onRecv: false,
            recvWait: 5000,          //Time interval in milliseconds between receiving queued jquery calls.
        },

        _create: function () {

            $(this.element).addClass('share-frame');

            //write debug statements if applicable
            if (debug)
                alert($(this.element).attr('id') + ': ' + this.options.url + ', channel: ' + this.options.channel + ', token: ' + this.options.token);

            //start background send and receive functions...
            if (this.options.mode == 'poll' && this.options.recvWait > 0)
                this.recv([this.element, this.options.recvWait, this.options.url + '', this.options.channel + '', this.options.token, this.options.callOnSend]);
        },

        destroy: function () {
        },

        _send_polling: function (data) {
            
            var paramdata = {
                'channel': this.options.channel,
                'token': this.options.token,
                'command': 'send',
                'calls': JSON.stringify(data)
            };

            if (debug)
                alert('send(): ' + JSON.stringify(paramdata));

            $.ajax({
                url: this.options.url,
                type: 'POST',
                dataType: 'json',
                data: paramdata,
                success: function (data) {
                    if (debug)
                        alert('send() success!');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (debug)
                        alert('send() error!\r\n\r\n' + errorThrown);
                }
            });
        },

        //sends command data to the server.
        send: function (data) {
            if (this.options.mode == 'poll')
                this._send_polling(data);
            else if (this.options.onSend)
                this.options.onSend(data);
        },

        _recv_polling: function (params) {
            var element = params[0],
                recvWait = params[1],
                url = params[2],
                channel = params[3],
                token = params[4],
                callOnSend = params[5];

            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {
                    channel: channel,
                    token: token,
                    command: 'recv'
                },
                element: params[0],
                channel: channel,
                token: token,
                success: function (data, status, xhr) {
                    if (data.length > 0) {
                        if (debug)
                            alert('recv() on channel ' + channel + ' with token ' + token + ': ' + JSON.stringify(data));
                        while (data.length > 0) {
                            var item = data.shift();
                            var sel = (item.select && item.select.length > 0 ? $(item.select, element) : $(element));
                            calljQueryFn(sel, item.fnName, item.params);
                        }
                    }
                }
            });

            //call this function again at the specified interval.
            if (recvWait > 0)
                setTimeout(arguments.callee, recvWait, [element, recvWait, url, channel, token, callOnSend]);
        },

        //receives and processes any commands from the server.
        recv: function (params) {
            if (this.options.mode == 'poll')
                this._recv_polling(params);
            else if (this.options.onRecv)
                this.options.onRecv(params);
        },

        //provides a psudo-jQuery function list that automatically performs the send commands.
        select: function (selector) {

            //alert('$: ' + $(this.element).attr('id') + ', token: ' + this.options.token);
            var contextResult = {
                selector: null,
                share: null,

                _select: function () {
                    if (selector && selector.length > 0)
                        return $(selector, this.share.element);
                    return $(this.share.element);
                },

                _send: function (selector, fnName, params) {
                    var data = [{
                        select: selector,
                        fnName: fnName,
                        params: params
                    }];
                    this.share.send(data);
                },

                //JQUERY UI FUNCTIONS:                

                //jQuery UI effect()
                effect: function (name, options, speed) {
                    this._send(selector, 'effect', [name, options, speed]);

                    if (this.share.options.callOnSend)
                        calljQueryFn(this._select(), 'effect', [name, options, speed]);

                    return this;
                },

                //jQuery UI switchClass()
                switchClass: function (add, remove, d) {
                    this._send(selector, 'switchClass', [add, remove, d]);

                    if (this.share.options.callOnSend)
                        calljQueryFn(this._select(), 'switchClass', [add, remove, d]);

                    return this;
                },

                //JQUERY EFFECTS FUNCTIONS:

                //jQuery animate()
                animate: function (desc, time, easing) {
                    this._send(selector, 'animate', [desc, time, easing]);

                    if (this.share.options.callOnSend)
                        this._select().animate(desc, time, easing);

                    return this;
                },

                //jQuery clearQueue()
                clearQueue: function (name) {
                    this._send(selector, 'clearQueue', [name]);

                    if (this.share.options.callOnSend)
                        this._select().clearQueue(name);

                    return this;
                },

                //jQuery delay()
                delay: function (d, name) {
                    this._send(selector, 'delay', [d, name]);

                    if (this.share.options.callOnSend)
                        this._select().delay(d, name);

                    return this;
                },

                //jQuery dequeue()
                dequeue: function (name) {
                    this._send(selector, 'dequeue', [name]);

                    if (this.share.options.callOnSend)
                        this._select().dequeue(name);

                    return this;
                },

                //jQuery fadeIn()
                fadeIn: function (d, e) {
                    this._send(selector, 'fadeIn', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().fadeIn(d, e);

                    return this;
                },

                //jQuery fadeOut()
                fadeOut: function (d, e) {
                    this._send(selector, 'fadeOut', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().fadeOut(d, e);

                    return this;
                },

                //jQuery fadeTo()
                fadeTo: function (d, o, e) {
                    this._send(selector, 'fadeTo', [d, o, e]);

                    if (this.share.options.callOnSend)
                        this._select().fadeTo(d, o, e);

                    return this;
                },

                //jQuery fadeToggle()
                fadeToggle: function (d, e) {
                    this._send(selector, 'fadeToggle', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().fadeToggle(d, e);

                    return this;
                },

                //jQuery hide() with UI effects
                hide: function (effect, options, speed) {
                    this._send(selector, 'hide', [effect, options, speed]);

                    if (this.share.options.callOnSend)
                        this._select().hide(effect, options, speed);

                    return this;
                },

                //jQuery queue()
                queue: function (d, e) {
                    this._send(selector, 'queue', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().queue(d, e);

                    return this;
                },

                //jQuery show() with UI effects
                show: function (effect, options, speed) {
                    this._send(selector, 'show', [effect, options, speed]);

                    if (this.share.options.callOnSend)
                        this._select().show(effect, options, speed);

                    return this;
                },

                //jQuery slideDown()
                slideDown: function (d, e) {
                    this._send(selector, 'slideDown', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().slideDown(d, e);

                    return this;
                },

                //jQuery slideToggle()
                slideToggle: function (d, e) {
                    this._send(selector, 'slideToggle', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().slideToggle(d, e);

                    return this;
                },

                //jQuery slideUp()
                slideUp: function (d, e) {
                    this._send(selector, 'slideUp', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().slideUp(d, e);

                    return this;
                },

                //jQuery stop()
                stop: function (q, c, j) {
                    this._send(selector, 'stop', [q, c, j]);

                    if (this.share.options.callOnSend)
                        this._select().stop(q, c, j);

                    return this;
                },

                //jQuery toggle()
                toggle: function (d, e) {
                    this._send(selector, 'toggle', [d, e]);

                    if (this.share.options.callOnSend)
                        this._select().toggle(d, e);

                    return this;
                },


                //JQUERY MANIPULATION FUNCTIONS:

                //jQuery addClass() with UI effects
                addClass: function (className, d) {
                    this._send(selector, 'addClass', [className, d])

                    if (this.callOnSend)
                        this._select().addClass(className, d);

                    return this;
                },

                //jQuery after()
                after: function (p1, p2) {
                    this._Send(selector, 'after', [p1, p2]);

                    if (this.share.options.callOnSend)
                        this._select().after(p1, p2);

                    return this;
                },

                //jQuery append()
                append: function (item, addt) {
                    this._send(selector, 'append', [item, addt]);

                    if (this.share.options.callOnSend)
                        this._select().append(item, addt);

                    return this;
                },

                //jQuery appendTo()
                appendTo: function (item) {
                    this._send(selector, 'appendTo', [item]);

                    if (this.share.options.callOnSend)
                        this._select().appendTo(item);

                    return this;
                },

                //jQuery attr()
                attr: function (n, val) {
                    this._send(selector, 'attr', [n, val]);

                    if (this.share.options.callOnSend)
                        this._select().attr(n, val);

                    return this;
                },

                //jQuery before()
                before: function (p1, p2) {
                    this._send(selector, 'before', [p1, p2]);

                    if (this.share.options.callOnSend)
                        this._select().before(p1, p2);

                    return this;
                },

                //jQuery css()
                css: function (name, val) {
                    this._send(selector, 'css', [name, val]);

                    if (this.share.options.callOnSend)
                        this._select().css(name, val);

                    return this;
                },

                //jQuery detach()
                detach: function (sel) {
                    this._send(selector, 'detach', [sel]);

                    if (this.share.options.callOnSend)
                        this._select().detach(sel);

                    return this;
                },

                //jQuery empty()
                empty: function () {
                    this._send(selector, 'empty', []);

                    if (this.share.options.callOnSend)
                        this._select().empty();

                    return this;
                },

                //jQuery height()
                height: function (val) {
                    this._send(selector, 'height', [val]);

                    if (this.share.options.callOnSend)
                        this._select().height(val);

                    return this;
                },

                //jQuery html()
                html: function (val) {
                    this._send(selector, 'html', [val]);

                    if (this.share.options.callOnSend)
                        this._select().html(val);

                    return this;
                },

                //jQuery insertAfter()
                insertAfter: function (item) {
                    this._send(selector, 'insertAfter', [item]);

                    if (this.share.options.callOnSend)
                        this._select().insertAfter(item);

                    return this;
                },

                //jquery insertBefore()
                insertBefore: function (item) {
                    this._send(selector, 'insertBefore', [item]);

                    if (this.share.options.callOnSend)
                        this._select().insertBefore(item);

                    return this;
                },

                //jQuery prepend()
                prepend: function (item, addt) {
                    this._send(selector, 'prepend', [item, addt]);

                    if (this.share.options.callOnSend)
                        this._select().prepend(item, addt);

                    return this;
                },

                //jQuery prependTo()
                prependTo: function (item) {
                    this._send(selector, 'prependTo', [item]);

                    if (this.share.options.callOnSend)
                        this._select().prependTo(item);

                    return this;
                },

                //jQuery prop()
                prop: function (name, val) {
                    this._send(selector, 'prop', [name, val]);

                    if (this.share.options.callOnSend)
                        this._select().prop(name, val);

                    return this;
                },

                //jQuery remove()
                remove: function (sel) {
                    this._send(selector, 'remove', [sel]);

                    if (this.share.options.callOnSend)
                        this._select().remove(sel);

                    return this;
                },

                //jQuery removeAttr()
                removeAttr: function (name) {
                    this._send(selector, 'removeAttr', [name]);

                    if (this.share.options.callOnSend)
                        this._select().removeAttr(name);

                    return this;
                },

                //jQuery removeClass() with UI effects
                removeClass: function (name, d) {
                    this._send(selector, 'removeClass', [name, d]);

                    if (this.share.options.callOnSend)
                        this._select().removeClass(name, d);

                    return this;
                },

                //jQuery removeProp()
                removeProp: function (name) {
                    this._send(selector, 'removeProp', [name]);

                    if (this.share.options.callOnSend)
                        this._select().removeProp(name);

                    return this;
                },

                //jQuery replaceAll()
                replaceAll: function (target) {
                    this._send(selector, 'replaceAll', [target]);

                    if (this.share.options.callOnSend)
                        this._select().replaceAll(target);

                    return this;
                },
                
                //jQuery replaceWith()
                replaceWith: function (content) {
                    this._send(selector, 'replaceWith', [content]);

                    if (this.share.options.callOnSend)
                        this._select().replaceWith(content);

                    return this;
                },

                //jQuery scrollLeft()
                scrollLeft: function (val) {
                    this._send(selector, 'scrollLeft', [val]);

                    if (this.share.options.callOnSend)
                        this._select().scrollLeft(val);

                    return this;
                },

                //jQuery scrollTop()
                scrollTop: function (val) {
                    this._send(selector, 'scrollTop', [val]);

                    if (this.share.options.callOnSend)
                        this._select().scrollTop(val);

                    return this;
                },

                //jQuery text()
                text: function (val) {
                    this._send(selector, 'text', [val]);

                    if (this.share.options.callOnSend)
                        this._select().text(val);

                    return this;
                },


                //jQuery toggle() with UI effects
                toggle: function (effect, options, speed) {
                    this._send(selector, 'toggle', [effect, options, speed]);

                    if (this.share.options.callOnSend)
                        this._select().toggle(effect, options, speed);

                    return this;
                },
                
                //jQuery toggleClass() with UI effects
                toggleClass: function (className, d) {
                    this._send(selector, 'toggleClass', [className, d]);

                    if (this.callOnSend)
                        this._select().toggleClass(className, d);

                    return this;
                },

                //jQuery unwrap()
                unwrap: function () {
                    this._send(selector, 'unwrap', []);

                    if (this.share.options.callOnSend)
                        this._select().unwrap();
                },

                //jQuery val()
                val: function (val) {
                    this._send(selector, 'val', [val]);

                    if (this.share.options.callOnSend)
                        this._select().val(val);
                },

                //jQuery width()
                width: function (val) {
                    this._send(selector, 'width', [val]);

                    if (this.share.options.callOnSend)
                        this._select().width(val);
                },

                //jQuery wrap()
                wrap: function (val) {
                    this._send(selector, 'wrap', [val]);

                    if (this.share.options.callOnSend)
                        this._select().wrap(val);
                },

                //jQuery wrapAll()
                wrapAll: function (val) {
                    this._send(selector, 'wrapAll', [val]);

                    if (this.share.options.callOnSend)
                        this._select().wrapAll(val);
                },

                //jQuery wrapInner()
                wrapInner: function (val) {
                    this._send(selector, 'wrapInner', [val]);

                    if (this.share.options.callOnSend)
                        this._select().wrapInner(val);
                }
            };

            contextResult.share = this;
            contextResult.selector = selector;
            return contextResult;
        },

        _setOption: function (option, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
        }

    });

})(jQuery);

function calljQueryFn(sel, fnName, params) {
    if (fnName == "effect")
        sel.effect(params[0], params[1], params[2]);
    else if (fnName == 'switchClass')
        sel.switchClass(params[0], params[1], params[2]);
    else if (fnName == "animate")
        sel.animate(params[0], params[1], params[2]);
    else if (fnName == "addClass")
        sel.addClass(params[0]);
    else if (fnName == "append")
        sel.append(params[0]);
    else if (fnName == "css")
        sel.css(params[0], params[1]);
    else if (fnName == "toggleClass")
        sel.toggleClass(params[0]);
}