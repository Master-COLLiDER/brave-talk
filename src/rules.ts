export interface BrowserProperties {
  isBrave: boolean;
  isMobile: boolean;
  isIOS: boolean;
  supportsWebRTC: boolean;
}

export interface Context {
  // we know the user has a valid subscription
  userIsSubscribed: boolean;

  browser: BrowserProperties;
}

export interface WelcomeScreenOptions {
  // UI eleements to show on welcome page
  showDownload?: boolean;
  showStartCall?: boolean;
  showSubscribeCTA?: boolean;
  showPremiumUI?: boolean;
  showCopyLinkForLater?: boolean;
  showUseDesktopMessage?: boolean;
  showFailureMessage?: string;

  // in some cases, we know the name room we'd want to join/create,
  // (e.g. when `create=y` is present), so allow override
  // of the auto-generated room name
  roomNameOverride?: string;
}

export function checkJoinRoom(
  roomName: string | undefined,
  browser: BrowserProperties
): string | undefined {
  if (roomName && browser.supportsWebRTC) {
    // direct room links open whenever supported
    return roomName;
  }

  return undefined;
}

// This is a pure function (its outputs should be a function of just its inputs,
// with no side effects or other calls) that, given a whole set of context,
// determines what the behaviour of the brave talk landing page should be.
export function determineWelcomeScreenUI(c: Context): WelcomeScreenOptions {
  if (!c.browser.isBrave) {
    return {
      showDownload: true,
    };
  }

  // on mobile only subscribed users can start a call
  if (c.browser.isMobile) {
    // lockdown mode and old iOS versions just won't work
    if (!c.browser.supportsWebRTC) {
      return {
        showFailureMessage:
          "Your iOS device appears to have Lockdown Mode enabled, which prevents Brave Talk from working.",
      };
    }

    if (c.userIsSubscribed) {
      return {
        showStartCall: true,
        showPremiumUI: true,
        showCopyLinkForLater: !c.browser.isIOS,
      };
    } else {
      return {
        showSubscribeCTA: true,
        showStartCall: true,
      };
    }
  }

  // on brave desktop
  return {
    showStartCall: true,
    showSubscribeCTA: !c.userIsSubscribed,
    showPremiumUI: c.userIsSubscribed,
    showCopyLinkForLater: c.userIsSubscribed,
  };
}
