/* globals chrome: FALSE, i18n: FALSE, VideoPlayerManager: FALSE */
/** @namespace chrome.extension.getURL **/
/** @namespace chrome.i18n.getMessage **/

/**
 * This component is responsible for all the changes made in the Youtube interface, such as adding/removing elements,
 * as well as checking if elements exists or not.
 * Inputs:
 *      - A HTMLDocument object representing hopefully a YouTube video page.
 * Results:
 *      - This component will make the necessary changes to the interface as requested by the user.
 */

var YoutubeInterfaceManager;
(function () {
    "use strict";

    YoutubeInterfaceManager = function (document) {
        this.document = document;
        this.videoPlayerManager = null;
    };

    YoutubeInterfaceManager.prototype.isYoutubeVideoUnavailable = function () {
        var divPlayerUnavailable = this.document.getElementById("player-unavailable");

        // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
        // classe "hid", visto que esta classe tem como função esconder os elementos.
        return divPlayerUnavailable && divPlayerUnavailable.className.indexOf("hid") === -1;
    };

    YoutubeInterfaceManager.prototype.hideElement = function (element) {
        if (element) {
            element.style.display = "none";
        }
    };

    // This function enables theater mode on a Youtube video page, centering the video frame and also hides the sidebar
    YoutubeInterfaceManager.prototype.enableTheaterMode = function () {
        var theaterBackground, divPage, divVideoInfo;

        theaterBackground = this.document.getElementById("theater-background");
        theaterBackground.style.background = "transparent";

        divPage = this.document.getElementById("page");
        divPage.classList.add("watch-stage-mode");
        divPage.classList.add("watch-wide");
        divPage.style.marginTop = "7px";

        divVideoInfo = this.document.getElementById("watch7-content");
        divVideoInfo.style.float = "none";
        divVideoInfo.style.margin = "auto";
        divVideoInfo.style.left = "0";
        divVideoInfo.classList.add("player-width");

        // We change the id, so that styles related to the old id don't apply anymore.
        divVideoInfo.id = "new-watch7-content";

        // Hiding the sidebar
        this.hideElement(this.document.getElementById("watch7-sidebar"));
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    YoutubeInterfaceManager.prototype.replaceIconVideoUnavailable = function () {
        var icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];

        icon.setAttribute('previous_background_img', window.getComputedStyle(icon, null).backgroundImage);

        icon.style.backgroundImage = 'url(' + chrome.extension.getURL("/images/mainIcon.png") + ')';
    };

    YoutubeInterfaceManager.prototype.addIconVideoUnavailable = function () {
        var icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
        icon.style.backgroundImage = icon.getAttribute('previous_background_img');
    };

    YoutubeInterfaceManager.prototype.addSpinner = function () {
        var mainMessage = this.document.getElementById('unavailable-message');

        mainMessage.innerHTML = '<div class="ytp-spinner" data-layer="4" style="left: 0; margin-left: 0; display: inline-block;position: relative;width: 28px;height: 22px;top: 5px;"><div class="ytp-spinner-dots">' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div>' +
            '<div class="ytp-spinner-message" style="display: none;">Se a reprodução não começar em instantes, reinicie seu dispositivo.</div></div>' + mainMessage.innerHTML;
    };

    YoutubeInterfaceManager.prototype.removeSpinner = function () {
        this.hideElement(this.document.getElementsByClassName("ytp-spinner")[0]);
    };

    YoutubeInterfaceManager.prototype.showLoadingFeedback = function () {
        var mainMessage, submainMessage;

        this.replaceIconVideoUnavailable();

        this.removeErrorAlert();

        mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerHTML = chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube', "<span style='display: inline-block; color: red;'>F*ck Youtube</span>");

        submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        this.addSpinner();
    };

    YoutubeInterfaceManager.prototype.hideLoadingScreen = function () {
        this.hideElement(this.document.getElementById("player-unavailable"));
    };

    YoutubeInterfaceManager.prototype.createVideoFrame = function (link) {
        var divPlayerAPI, self = this;

        divPlayerAPI = this.document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        console.log(this.document.getElementById('movie_player'));

        // By creating the video player manager, we create the video frame
        this.videoPlayerManager = new VideoPlayerManager(link, divPlayerAPI, this);
        
        // We will only hide the loading screen, when the video is ready to play.
        this.videoPlayerManager.video.oncanplay = function () {
            self.hideLoadingScreen();
        };
    };

    // This function will remove the error alert shown by YouTube if it is present
    YoutubeInterfaceManager.prototype.removeErrorAlert = function () {
        this.hideElement(this.document.getElementById('error-box'));
    };

    YoutubeInterfaceManager.prototype.showErrorAlert = function () {
        var alertsDiv, alertContent, alertWrapper;

        alertsDiv = this.document.getElementById('error-box') || this.document.getElementById('editor-progress-alert-template');

        alertsDiv.style.display = 'block';
        alertsDiv.classList.remove('yt-alert-warn');
        alertsDiv.classList.add("yt-alert-error");

        alertContent = alertsDiv.getElementsByClassName('yt-alert-content')[0];
        alertContent.innerText = chrome.i18n.getMessage("noVideoFoundMessage") + " :(";

        alertWrapper = this.document.getElementsByClassName("alerts-wrapper")[0];

        if (alertWrapper) {
            alertWrapper.style.backgroundColor = "transparent";
        }
    };

    YoutubeInterfaceManager.prototype.showFailureMessage = function () {
        var mainMessage, submainMessage;

        this.addIconVideoUnavailable();

        mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerText = chrome.i18n.getMessage("videoUnavailableMessage");

        submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("sorryMessage");

        this.removeSpinner();

        this.showErrorAlert();
    };
}());