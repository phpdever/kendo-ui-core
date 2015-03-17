﻿<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1"  ContentPlaceHolderID="MainContent" runat="server">
<script src=" <%= Url.Content("~/Content/web/integration/jquery.signalr-1.1.3.min.js")%>"></script>
<script>
    var hubUrl = "http://demos.telerik.com/kendo-ui/service/signalr/hubs";
    var connection = $.hubConnection(hubUrl, { useDefaultPath: false });
    var meetingHub = connection.createHubProxy("meetingHub");
    var hubStart = connection.start({ jsonp: true });

    function onPush(e) {
        var notification = $("#notification").data("kendoNotification");
        notification.success(e.type);
    }
</script>

<%= Html.Kendo().Notification()
    .Name("notification")
    .Width("100%")
    .Position(position => position
        .Top(0)
        .Left(0))
%>

<%=Html.Kendo().Scheduler<Kendo.Mvc.Examples.Models.Scheduler.MeetingSignalRViewModel>()
    .Name("scheduler")
    .Date(new DateTime(2013,6 ,13))
    .StartTime(new DateTime(2013, 6, 13, 7, 00, 00))
    .Height(600)
    .Views(views =>
    {
        views.DayView();
        views.WeekView(weekView => weekView.Selected(true));
        views.MonthView();
        views.AgendaView();
        views.TimelineView();
    })
    .Timezone("Etc/UTC")
    .Resources(resource =>
         {
            resource.Add(m => m.RoomID)
                .Title("Room")
                .DataTextField("Text")
                .DataValueField("Value")
                .DataColorField("Color")
                .BindTo(new[] { 
                    new { Text = "Meeting Room 101", Value = 1, Color = "#6eb3fa" },
                    new { Text = "Meeting Room 201", Value = 2, Color = "#f58a8a" } 
                });
            resource.Add(m => m.Attendees)
                .Title("Attendees")
                .Multiple(true)
                .DataTextField("Text")
                .DataValueField("Value")
                .DataColorField("Color")
                .BindTo(new[] { 
                    new { Text = "Alex", Value = 1, Color = "#f8a398" },
                    new { Text = "Bob", Value = 2, Color = "#51a0ed" },
                    new { Text = "Charlie", Value = 3, Color = "#56ca85" } 
                });
         })
    .DataSource(dataSource => dataSource
        .SignalR()
        .Events(events => events.Push("onPush"))
        .Transport(tr => tr
            .Promise("hubStart")
            .Hub("meetingHub")
            .Client(c => c
                .Read("read")
                .Create("create")
                .Update("update")
                .Destroy("destroy"))
            .Server(s => s
                .Read("read")
                .Create("create")
                .Update("update")
                .Destroy("destroy")))
        .Schema(schema => schema
            .Model(model =>
            {
                model.Id(m => m.ID);
                model.Field(m => m.ID).Editable(false);
                model.Field("start", typeof(DateTime)).From("Start");
                model.Field("end", typeof(DateTime)).From("End");
                model.Field("title", typeof(string)).From("Title");
                model.Field("description", typeof(string)).From("Description");
                model.Field("recurrenceID", typeof(int)).From("RecurrenceID");
                model.Field("recurrenceRule", typeof(string)).From("RecurrenceRule");
                model.Field("recurrenceException", typeof(string)).From("RecurrenceException");
                model.Field("isAllDay", typeof(bool)).From("IsAllDay");
                model.Field("startTimezone", typeof(string)).From("StartTimezone");
                model.Field("endTimezone", typeof(string)).From("EndTimezone");
            })
        )
    )
%>
<br />
<div class="configuration-horizontal">
    <span class="configHead">Information</span>
    <p>
    This demo demonstrates real-time push-notifications from <a href="http://signalr.net/">SignalR</a>.
    </p>
    <p>
        To see the real-time updates:
    </p>
    <ol>
        <li>Open this page in another browser window by clicking <a href="./signalr" target="_new">here</a></li>
        <li>Create, update or destroy Scheduler items.</li>
    </ol>
</div>
</asp:Content>