(function () {
  'use strict';

  function plan(view) {
    if (!view || view.sick || view.energy < 0.25 || !Array.isArray(view.free) || !view.free.length) {
      return { blocks: [], note: view && view.sick ? 'Resting while sick' : 'Rest and recharge', memo: {} };
    }

    var subjects = Array.isArray(view.subjects) ? view.subjects : [];
    var topics = Array.isArray(view.topics) ? view.topics : [];
    var learned = topics.filter(function (t) { return t.learned; });
    var fresh = topics.filter(function (t) { return !t.learned; });
    var used = [];
    var blocks = [];
    var day = Number(view.dayIx) || 0;
    var lessonDue = day % 3 === 0 && fresh.length > 0;

    fresh.sort(function (a, b) {
      var sa = subjects.find(function (s) { return s.track === a.track; });
      var sb = subjects.find(function (s) { return s.track === b.track; });
      var pa = (sa && sa.weak ? 2 : 0) + (sa ? Number(sa.tgt || 0) - Number(sa.cur || 0) : 0);
      var pb = (sb && sb.weak ? 2 : 0) + (sb ? Number(sb.tgt || 0) - Number(sb.cur || 0) : 0);
      return pb - pa || a.n - b.n || String(a.track).localeCompare(String(b.track));
    });

    learned.sort(function (a, b) {
      var sa = subjects.find(function (s) { return s.track === a.track; });
      var sb = subjects.find(function (s) { return s.track === b.track; });
      var ageA = a.lastDay == null ? 999 : day - a.lastDay;
      var ageB = b.lastDay == null ? 999 : day - b.lastDay;
      var scoreA = ageA + (sa && sa.weak ? 10 : 0) + (a.lastN && a.lastRight < a.lastN / 2 ? 20 : 0);
      var scoreB = ageB + (sb && sb.weak ? 10 : 0) + (b.lastN && b.lastRight < b.lastN / 2 ? 20 : 0);
      return scoreB - scoreA || String(a.id).localeCompare(String(b.id));
    });

    var topicAt = 0;
    for (var w = 0; w < view.free.length && blocks.length < 2; w++) {
      var start = Math.max(0, Number(view.free[w][0]) || 0);
      var end = Math.max(start, Number(view.free[w][1]) || start);
      var at = start;
      while (at < end && blocks.length < 2) {
        var room = end - at;
        var blockTasks = [];
        var duration = 0;
        if (lessonDue && blocks.length === 0 && room >= 20) {
          var freshTopic = fresh[0];
          blockTasks.push({ kind: 'learn', topic: freshTopic.id, min: 20 });
          duration = 20;
          lessonDue = false;
        }
        while (topicAt < learned.length && blockTasks.length < 12 && room - duration >= 3) {
          var t = learned[topicAt++];
          if (used.indexOf(t.id) !== -1) continue;
          blockTasks.push({ kind: 'quiz', topic: t.id, min: 3 });
          used.push(t.id);
          duration += 3;
        }
        if (!blockTasks.length) break;
        blocks.push({ at: at, tasks: blockTasks });
        at += duration + 5;
      }
    }

    if (!blocks.length) return { blocks: [], note: 'Rest and recharge', memo: {} };
    var didLearn = blocks.some(function (b) { return b.tasks.some(function (t) { return t.kind === 'learn'; }); });
    return {
      blocks: blocks,
      note: didLearn ? 'Two spaced quiz blocks and one new topic' : 'Two spaced blocks on weak, fading topics',
      memo: {}
    };
  }

  globalThis.COACH_CODEX = Object.freeze({
    name: 'Codex',
    about: 'I use two spaced quiz blocks on weak, fading topics, with one new topic every few days to keep mock knowledge growing.',
    version: 1,
    plan: plan
  });
}());
