using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.SessionState;

namespace jQuery.UI.Prism.Server
{
    /// <summary>
    /// Handles jQuery prism commands.
    /// </summary>
    public class PrismServerHandler : IHttpHandler, IRequiresSessionState
    {

        class Item
        {
            public string Token { get; set; }
            public string Data { get; set; }
        }

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            
            string channel = context.Request["channel"];
            string token = context.Request["token"];
            string command = context.Request["command"];

            if (context.Session["Queue"] == null)
                context.Session["Queue"] = new Dictionary<string, List<Item>>();

            if (context.Session["Index"] == null)
                context.Session["Index"] = new Dictionary<string, int>();

            Dictionary<string, List<Item>> queues = (Dictionary<string, List<Item>>)context.Session["Queue"];
            Dictionary<string, int> indexes = (Dictionary<string, int>)context.Session["Index"];

            if (command == "send")
            {
                if (context.Request["calls"] == null)
                {
                    context.Response.Write("{ \"result\": \"error\", \"message\": \"send() expected parameter [calls].\" }");
                    return;
                }

                lock (queues)
                {
                    if (!queues.ContainsKey(channel))
                        queues.Add(channel, new List<Item>());

                    queues[channel].Add(new Item() { Token = token, Data = context.Request["calls"].ToString().Trim('[', ']') });
                    context.Response.Write("{ \"result\": \"success\" }");
                }
            }
            else if (command == "recv")
            {
                StringBuilder b = new StringBuilder();
                b.Append('[');

                int counter = 0;
                int index = -1;

                //get current index.
                lock (indexes)
                {
                    if (!indexes.ContainsKey(token))
                        indexes.Add(token, 0);
                    index = indexes[token];
                }

                //loop through any unread commands in the channel queue.
                lock (queues)
                {
                    if (!queues.ContainsKey(channel))
                        queues.Add(channel, new List<Item>());

                    for (; index < queues[channel].Count; index++)
                    {
                        if (queues[channel][index].Token == token)
                            continue;

                        if (counter > 0)
                            b.Append(',');
                        b.Append(queues[channel][index].Data);
                        counter++;
                    }
                }

                //update the index after finishing.
                lock (indexes)
                {
                    indexes[token] = index;
                }

                b.Append(']');
                context.Response.Write(b.ToString());
            }
            else if (command == "clear")
            {
                lock (indexes)
                {
                    context.Session["Index"] = null;
                }

                lock (queues)
                {
                    context.Session["Queue"] = null;
                }
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}