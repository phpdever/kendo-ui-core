﻿<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

<div class="demo-section k-content" style="text-align: center;">
    <h4>Pick a date</h4>

<%=Html.Kendo().Calendar()
      .Name("calendar")
      .Format("MM/dd/yyyy")
      .Selection(select =>
      {
          select.Action("SelectAction", "Calendar", new { date = "{0}" })
                .Dates(new List<DateTime> { 
                    DateTime.Today,
                    DateTime.Today.AddDays(5),
                    DateTime.Today.AddDays(-5),
                    DateTime.Today.AddMonths(1), 
                    DateTime.Today.AddMonths(-1) 
                });
      })
      .Value(ViewBag.date as DateTime?)
%>
</div>
<div class="demo-section k-content" style="text-align: center;">
<% if (ViewBag.date != null) { %>
        <h4>Picked Date:</h4>
        <p><%=ViewBag.date%></p>
<%    }
    else { %>
        <h4>Pick an action date from the calendar above <br />(undelined item)</h4>
<% } %>
</div>
</asp:Content>