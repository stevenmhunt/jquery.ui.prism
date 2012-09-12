jquery.ui.prism
============

**Version 0.1**

*Supports synchronization of jQuery calls between multiple clients through a client/server interface.*

Features
--------

Allows jQuery calls to be synchronized between clients automatically.

Works as a jQuery UI control so that call sychronization is contained within specified DOM elements.

Supports multiple channels so multiple connections can run on a single page.

Supported jQuery Functions
--------------------------

<table>
<thead>
<tr>
<th>Category</th>
<th>Function Name</th>
</tr>
</thead>
<tbody>
<tr><td>UI</td><td>effect, switchClass</td></tr>
<tr><td>Effect</td><td>animate, clearQueue, delay, dequeue, fadeIn, fadeOut, fadeTo, fadeToggle, hide, queue, show, slideDown, slideToggle, SlideUp, stop, toggle</td></tr>
<tr><td>Manipulation</td><td>addClass, after, append, appendTo, attr, before, css, detach, empty, height, html, insertAfter, insertBefore, prepend, prependTo, prop, remove, removeAttr, removeClass, removeProp, replaceAll, replaceWith, scrollLeft, scrollTop, text, toggle, toggleClass, unwrap, val, width, wrap, wrapAll, wrapInner
</tbody>
</table>

How to use
----------

1) Include the .js file in your html file.

2) Select a container, and call the prism() extension:

```javascript
  $('#prism_container').prism({
    url: 'Share.ashx',  // url to the server component for prism.
    channel: 'A',       // channels allow for a server to handle multiple sets of calls at once.
    token: 'T1',        // a token helps identify a specific client connecting.
    recvWait: 200,      // the time delay between polls.
    callOnSend: true,   // tells prism to automatically send the call to the server when called by javascript.
  });
```

3) When you want prism to send calls to the server, use the "select" method with a selector:

```javascript

  $('#prism_container').prism('select', '.some-class').append('<h1>I show up on all connected clients!</h1>');

```

Future releases
---------------

Support for Web Sockets to reduce performance issues related to server polling.

Server-based authentication options.