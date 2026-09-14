# Feedback

OODS Forge is released to individuals so it can be proven out. What you noticed is the point of the release, and a short note is worth more than a polished one. Everything below goes through GitHub Issues on this repository; two templates keep it quick.

## What helps most

- **A screen that reads wrong.** A composed or generated screen where a component, a label, a grouping or an ordering is not what the object called for.
- **A certification result you disagree with.** `artifact.certify` said pass and you can see a problem, or it said fail and the chart looks right to you.
- **Install friction.** Anything between downloading the release and the first `health` call that took longer than it should, including how long it took.
- **A chart that says the wrong thing.** A `viz.render` or `dashboard.render` output whose scale, encoding, legend or narrative misrepresents the rows you gave it.
- **A sentence that did not make sense.** In the README, `install.md`, a tool description or an error message.

## What to include

- The tool call as you made it (tool name and the arguments) and the output you got back, or the part of it that matters.
- A screenshot or the saved HTML when the problem is visual.
- The client you used (Claude Desktop, Claude Code or Cursor) and the runtime version from `forge-runtime.manifest.json` (its `commit` field) or the release tag.
- What you expected instead, in one line.

Copying the assistant's transcript of the call is fine; the tool arguments and the output are what make an issue reproducible.

## Where

- Something behaved wrongly: [Bug report](https://github.com/kneelinghorse/OODS-Forge/issues/new?template=bug-report.yml).
- Something did not read right (a screen, a chart, a document, an error message): [This did not read right](https://github.com/kneelinghorse/OODS-Forge/issues/new?template=did-not-read-right.yml).
- Something you wish existed: [Feature request](https://github.com/kneelinghorse/OODS-Forge/issues/new?template=feature-request.yml).
- Licensing and commercial questions: [COMMERCIAL.md](COMMERCIAL.md) and [docs/LICENSE-FAQ.md](docs/LICENSE-FAQ.md); the contact address is in COMMERCIAL.md.
- Security reports: [SECURITY.md](SECURITY.md).

There is no mailing list, chat or forum. Issues are read; not every issue gets a reply, and none gets a promise of a timeline.
