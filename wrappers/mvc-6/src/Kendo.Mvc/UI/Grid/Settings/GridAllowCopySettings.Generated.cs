using Kendo.Mvc.Extensions;
using Microsoft.AspNet.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Kendo.Mvc.UI
{
    /// <summary>
    /// Kendo UI GridAllowCopySettings class
    /// </summary>
    public partial class GridAllowCopySettings<T> 
    {
        public string Delimeter { get; set; }

        public bool Enabled { get; set; }

        protected Dictionary<string, object> SerializeSettings()
        {
            var settings = new Dictionary<string, object>();

            if (Delimeter.HasValue())
            {
                settings["delimeter"] = Delimeter;
            }

            return settings;
        }
    }
}
