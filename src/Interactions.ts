import { Command, Component } from "./InteractionEssentials";

import { CmdPing } from "./commands/Ping";
import { CmdDonate } from "./commands/Donate";
import { CmdCodenames } from "./commands/Codenames";
import { CmdFeedback } from "./commands/Feedback";
import { CmdQuote } from "./commands/Quote";
import { CmdQuoteGuesser } from "./commands/QuoteGuesser";
import { CmdConnections } from "./commands/Connections";
import { CmdSettings } from "./commands/Settings";
import { CmdChangelog } from "./commands/Changelog";

import { BtnQuoteList } from "./components/QuoteList";
import { BtnQuoteGuesser, SsmQuoteGuesser } from "./components/QuoteGuesser";
import { BtnConnectionList, BtnFollowMenu } from "./components/Connections";
import { BtnChangelog } from "./components/Changelog";

export const Commands: Command[] = [
    CmdCodenames,
    CmdFeedback,
    CmdDonate,
    CmdPing,
    CmdQuote,
    CmdQuoteGuesser,
    CmdConnections,
    CmdSettings,
    CmdChangelog,
];

export const Components: Component<any>[] = [
    BtnQuoteList,
    BtnQuoteGuesser,
    SsmQuoteGuesser,
    BtnFollowMenu,
    BtnConnectionList,
    BtnChangelog,
];
