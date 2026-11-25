---
title: "Choo is here: never miss the next train past your bridge"
summary: "I built Choo so my toddler and I would know when the next train was coming past our bridge. Here’s what it does, and how it works it out."
---

Hello, and welcome to the Choo blog. This is the first post, and it comes with some news: Choo is now on the [App Store](https://apps.apple.com/gb/app/choo-live-train-tracker/id6828141748) for iPhone.

## Why I made it

I have a toddler who loves watching trains. So we spend a lot of time on a footbridge that runs over our local rail line, waiting.

Once a train has passed, she immediately wants the next one ("more!"). Looking up departures or arrivals at the nearest station doesn't fully answer the question: we're not at the station, and half the trains that came past weren’t on any board at all: the fast ones that don’t stop, freight trains, and some other unusual ones. Sometimes we’d wait ten minutes for nothing; sometimes one would rush past while we were looking the other way.

So I built the thing I wanted: a countdown to the next train past the exact place we were standing.

## What it does

Choo counts down to the next train past the place you’re watching from: a bridge, a footpath, the end of a platform. You choose the spot by dropping a pin on the map. Each spot’s pin then counts down to the next train past it, with an arrow showing which way it’s going, so you know where to look.

- **Add your own spots.** Long-press the map beside any railway, and Choo works out which line it is and which trains use it.
- **Trains Here.** Standing by the line somewhere new? Choo shows a countdown for right where you are, with nothing to set up.
- **Every train, not just the ones that stop.** Freight, test trains, charters, leaf-clearing trains and engines out on their own are all there. You can opt in to notifications for when a special train will be passing your spots, even with the app closed.
- **“What’s that one?”** Tap any train to see its type, a picture, how many carriages it has, and its whole journey.
- **Waiting made easy.** Follow a spot on your Lock Screen and in the Dynamic Island while you walk to the bridge, or put it on a Home Screen widget.

It covers National Rail right across Great Britain, plus the Tube, DLR, Overground and Elizabeth line in London. No ads, no accounts, no tracking.

## The clever bit

Nobody publishes exactly where every train is. What the railway does publish is its timetables, live reports of trains reaching and leaving places, and the signalling’s record of every train moving from one section of line to the next. Choo puts those together.

Our server follows every train in Great Britain using National Rail’s feed, Network Rail’s timetables, movement reports and train describers (the signalling), and TfL’s data for the Tube. From the timetable it works out when each train should pass your spot, part-way between stations, using the shape of the track, the line’s speed limits and how fast that kind of train can go. Then it watches the real trains: it learns how long they take from each signal to the next station, and how long they stand at each platform. In the last few minutes before a train reaches you, the countdown comes straight from the signals, and runs to the second: `0:03`, `0:02`, `0:01`, “Now!”.

<!-- If you’d like the full story, with diagrams of signals, berths and why a junction in Perthshire was once placed in London, read [How Choo predicts when a train will pass your bridge](/blog/how-choo-works/). -->

## Thank you

Choo is made by one person, and I'm limited on how many trains I can check! If you spot a timing that’s out, tell me from the app’s Report an Issue or the [support page](https://choo.express/support.html).

Now, off to find a bridge. Ready, steady… Choo!

[Get Choo on the App Store](https://apps.apple.com/gb/app/choo-live-train-tracker/id6828141748)
