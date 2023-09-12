let creditOptionSelected = 50;
let warned = false;
const privatePlayer = IVSPlayer.create();
function hideAllChatTabs() {
  const tabs = document.querySelectorAll(".chatbox-tab");
  tabs.forEach(tab => {
    tab.classList.remove("active");
  });
}
let elapsed_time = 0;
let elapsed_time_interval;
let channel_id_private =
  "arn:aws:ivschat:us-east-1:701253760804:room/MjmBSFqWGelM";

let privateCreateQualityOptions = function (obj, i) {
  const btnSettings = document.getElementById("private-settings");
  let settingsMenu = document.getElementById("private-settings-menu");
  let q = document.createElement("a");
  let qText = document.createTextNode(obj.name);
  settingsMenu.appendChild(q);
  q.classList.add("settings-menu-item");
  q.appendChild(qText);

  q.addEventListener("click", event => {
    privatePlayer.setQuality(obj);
    btnSettings.classList.remove("btn--settings-on");
    btnSettings.classList.add("btn--settings-off");
    // settingsMenu.classList.remove("open");
    return false;
  });
};

const onSettingsClick = () => {
  const btnSettings = document.getElementById("private-settings");
  let settingsMenu = document.getElementById("private-settings-menu");
  let qualities = privatePlayer.getQualities();
  let currentQuality = privatePlayer.getQuality();

  // Empty Settings menu
  while (settingsMenu.firstChild)
    settingsMenu.removeChild(settingsMenu.firstChild);

  if (btnSettings.classList.contains("btn--settings-off")) {
    for (var i = 0; i < qualities.length; i++) {
      privateCreateQualityOptions(qualities[i], i);
    }
    btnSettings.classList.remove("btn--settings-off");
    btnSettings.classList.add("btn--settings-on");
    settingsMenu.classList.add("open");
  } else {
    btnSettings.classList.remove("btn--settings-on");
    btnSettings.classList.add("btn--settings-off");
    settingsMenu.classList.remove("open");
  }
};
// Close Settings menu if user clicks outside the player
window.addEventListener("click", function (e) {
  const btnSettings = document.getElementById("private-settings");
  if (playerOverlay.contains(e.target)) {
  } else {
    btnSettings.classList.remove("btn--settings-on");
    btnSettings.classList.add("btn--settings-off");
    settingsMenu.classList.remove("open");
  }
});

let setPrivateBtnPaused = function () {
  document.getElementById("private-play").classList.remove("btn--play");
  document.getElementById("private-play").classList.add("btn--pause");
};

let setPrivateBtnPlay = function () {
  document.getElementById("private-play").classList.add("btn--play");
  document.getElementById("private-play").classList.remove("btn--pause");
};

let setPrivateBtnMute = function () {
  document.getElementById("private-mute").classList.remove("btn--mute");
  document.getElementById("private-mute").classList.add("btn--unmute");
};

let setPrivateBtnUnmute = function () {
  document.getElementById("private-mute").classList.add("btn--mute");
  document.getElementById("private-mute").classList.remove("btn--unmute");
};
const onPrivatePlayClick = () => {
  if (document.getElementById("private-play").classList.contains("btn--play")) {
    // change to pause
    setPrivateBtnPaused();
    privatePlayer.pause();
  } else {
    // change to play
    setPrivateBtnPlay();
    privatePlayer.play();
  }
};
const onPrivateMuteclick = () => {
  if (document.getElementById("private-mute").classList.contains("btn--mute")) {
    setPrivateBtnMute();
    privatePlayer.setMuted(1);
  } else {
    setPrivateBtnUnmute();
    privatePlayer.setMuted(0);
  }
};
// Mute/Unmute

const insertPrivateStreamImage = src => {
  var element = document.getElementById("statusPrivateImage");
  if (typeof element != "undefined" && element != null) {
    element.remove();
  }
  const imageElement = document.createElement("img");
  imageElement.style = "width:100%;height:100%;position:absolute;z-index:10;";
  imageElement.setAttribute("id", "statusPrivateImage");
  imageElement.src = src;
  document.getElementById("video-section").appendChild(imageElement);
};
const handleChatInviteDecline = data => {
  if (data.Attributes.userToken == ClientToken) {
    showPrettyModal(
      "Private Chat Request Declined",
      "The streamer has declined your request to chat privately."
    );
    document.getElementById("requestButton-container").innerHTML = `
    <button
                        disabled
                        id="requestButton"
                        onclick="requestPrivateStream()"
                      >
                        Watch Private Stream
                      </button>
  `;
  }
};
const handleChatInviteAccept = data => {
  if (data.Attributes.userToken == ClientToken) {
    setTimeout(() => {
      elapsed_time_interval = setInterval(() => {
        elapsed_time++;
        let mins = Math.floor(elapsed_time / 60);
        let secs = elapsed_time % 60;
        document.getElementById(
          "elapsed-time"
        ).innerText = `Elapsed Time: ${mins}:${secs > 9 ? secs : `0${secs}`}`;
      }, 1000);
    }, 12000);
    insertPrivateStreamImage("./assets/waiting-for-streamer.png");
    showPrettyModal(
      "Private Stream",
      "Your request for private stream has been accepted! Stream will start playing in few seconds."
    );
    privateChatPopup(data.Attributes.privateChannelLink);

    document.getElementById("loader").style.zIndex = -1;
    clearInterval(updateViewerCountInterval);
    document.getElementById("loader").style.display = "none";
    console.log("stream in private session");
    document.getElementById("sendButton").disabled = true;
    // document.getElementById("textBox").disabled = true;
    // document.getElementById("streamStatus").innerText = "";

    // document.getElementById("viewPrivate").disabled = false;
    playing = false;
    paused = true;
  } else {
    player.pause();
    clearInterval(updateViewerCountInterval);
    document.getElementById("loader").style.display = "none";
    console.log("stream in private session");
    document.getElementById("sendButton").disabled = true;
    // document.getElementById("textBox").disabled = true;
    // document.getElementById("streamStatus").innerText = "";
    insertImage(placeholderUrl + "private.png");
    // document.getElementById("viewPrivate").disabled = false;
    playing = false;
    paused = true;
    HideRequestShowView();
  }
  document.getElementsByClassName("viewers-count")[0].innerHTML = ``;
};
const privateChatPopup = channel_id_private => {
  // insertPrivateStreamImage("./assets/waiting-for-streamer.png");
  privateChatInitalize(channel_id_private);
  updateRemainingCredits();
};

const privateChatInitalize = async channel_id_private => {
  const { connection, chatClientToken } = await open_channel(
    channel_id_private,
    "Private:",
    "us-east-1", // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId // Replace with your secret key id
  );
  privateConnection = connection;
  privateConnection.addEventListener("open", privateChatSocketListener);
  attachPrivateIVSStream();
  player.pause();
};
const privateChatSocketListener = () => {
  // document.getElementById("psendButton").disabled = false;
  privateConnection.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log({ data });
    if (data.Type == "MESSAGE") {
      const newElement = document.createElement("div");
      newElement.classList.add("message");
      newElement.classList.add("message-left");
      newElement.innerHTML = `
  <div class="img-container">
    <img
      src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      alt=""
    />
  </div>
  <div class="text-container">
    <div class="message-info">
      <span class="name">Sri Veronica</span>
      <span class="time">3:50 PM</span>
    </div>
    <p class="text">
     ${data.Content}
    </p>
  </div>
  `;
      document
        .getElementsByClassName("private-message-container")[0]
        .prepend(newElement);
    }
    if (data.Type == "EVENT" && data.EventName == "delete-channel") {
      handlePrivateStreamEnd(false);
      // setTimeout(() => {
      //   retyInsertStreamPlayback();
      // }, 2000);
    }
    if (data.Type == "EVENT" && data.EventName == "remaining-credits") {
      // document.getElementById(
      //   "remaining-credits"
      // ).innerText = `${data.Attributes.minutes}:${data.Attributes.seconds}`;
      let deducted = parseInt(data.Attributes.deduct);
      if (deducted > 0) {
        updateRemainingCredits();
      }
      if (
        parseInt(data.Attributes.minutes) == 0 &&
        parseInt(data.Attributes.seconds) < 20
      ) {
        if (warned) return;
        warned = true;
        buyMoreCreditsModal();
      }
    }
  };
};
const sendPrivateFunction = () => {
  const message = document.getElementById("privateTextBox").value;
  console.log({ message });
  if (message == "") return;
  document.getElementById("privateTextBox").value = "";
  send_message(privateConnection, message);
};

const attachPrivateIVSStream = () => {
  const PrivatePlayerEventType = IVSPlayer.PlayerEventType;
  const PrivatePlayerState = IVSPlayer.PlayerState;
  console.log("Private Player State", PrivatePlayerEventType);
  privatePlayer.addEventListener(
    PrivatePlayerEventType.ERROR,
    handlePrivateStreamError
  );
  privatePlayer.addEventListener(
    PrivatePlayerState.PLAYING,
    handlePrivateStreamPlaying
  );

  const videoElement = document.createElement("video");
  videoElement.setAttribute("id", "private-video-player");
  videoElement.style =
    "width: 100%;height: 100%;position: absolute;top: 0;background: #000;border-radius: var(--radius);object-fit: cover;display:none;z-index: 9;";
  document.getElementById("video-section").appendChild(videoElement);
  if (IVSPlayer.isPlayerSupported) {
    console.log("Private Player Mounted");
    privatePlayer.attachHTMLVideoElement(
      document.getElementById("private-video-player")
    );
    try {
      privatePlayer.load(
        "https://562d3781dc12.us-east-1.playback.live-video.net/api/video/v1/us-east-1.701253760804.channel.YgqVVS5EahGW.m3u8"
      );
      privatePlayer.play();
    } catch (e) {}
  }
};
const handlePrivateStreamError = err => {
  console.log("Private Stream Load Fail , Retrying in 2 seconds");
  document.getElementById("loader").style.display = "block";
  setTimeout(() => {
    privatePlayer.load(
      "https://562d3781dc12.us-east-1.playback.live-video.net/api/video/v1/us-east-1.701253760804.channel.YgqVVS5EahGW.m3u8"
    );
    privatePlayer.play();
  }, 2000);
};
let isAlreadyShown = false;
const showPrivateStreamPopup = () => {
  if (isAlreadyShown) return;
  const chatboxTabContainer = document.querySelector(".tab-content-container");
  chatboxTabContainer.style.display = "none";
  isAlreadyShown = true;
  document.getElementById("loader").style.zIndex = 9999;

  hideAllChatTabs();
};
const handlePrivateStreamPlaying = () => {
  document.getElementsByClassName("viewers-count")[0].innerHTML = ``;

  document.getElementById("private-player-controls").style.display = "block";
  document.getElementById("player-controls").style.display = "none";

  showPrivateStreamPopup();
  document.getElementById("private-video-player").style.display = "block";
  document
    .getElementById("private")
    .querySelector("span:first-child").textContent = "Go Public";
  document.getElementById("inputContainer").style.display = "none";
  document.getElementById("privateInputContainer").style.display = "flex";
  private_view_active = true;
  document.getElementById("messages").style.display = "none";
  console.log("Private Stream Playing");
  document.getElementById("privateMessages").style.display = "flex";

  if (!document.getElementById("private-banner")) {
    document.getElementById("private-player-controls").innerHTML += `
      <div id="private-banner"  style="
      height: var(--btn-size);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 0 10px 10px 10px;
       padding: 15px;
       top: 0;

      ">
         <img src="https://svgshare.com/i/AaW.svg" style="
         width: auto;
         margin: 3px;
         ">
         <p style="
         color: white;
         margin: 0;
         padding: 0;
         ">Private</p>
      </div>
    `;
  }
  document.getElementById("loader").style.display = "none";
  if (document.getElementById("requestLoader")) {
    document.getElementById("requestLoader").remove();
  }
  document.getElementById(
    "requestButton-container"
  ).innerHTML = `<button id="endPrivateStream" onclick="handlePrivateStreamEndOwn()">Stop Watching Private Stream</button>`;
  console.log("Private Stream Playing");
  if (document.getElementById("statusPrivateImage")) {
    document.getElementById("statusPrivateImage").remove();
  }
  if (document.getElementById("statusImage")) {
    document.getElementById("statusImage").remove();
  }
};
const handlePrivateStreamEndOwn = async () => {
  await handlePrivateStreamEnd();
  HideRequestShowView();
  hideAllChatTabs();
};
const updateRemainingCredits = () => {
  if (ivs_credits < private_stream_cost_per_second) {
    ivs_credits = 0;
  } else {
    ivs_credits -= private_stream_cost_per_second;
  }
  updateCreditRelatedUI();

  // document.getElementById("credits-left").innerText = ivs_credits;
};
// const refundRemainingTime = () => {
//   const time = document.getElementById("remaining-credits").innerText;
//   const [minutes, seconds] = time.split(":");
//   const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
//   if (totalSeconds < 10) return;
//   // private_stream_cost_per_second is cost per second of private stream
//   const thirtySecondRoundoff = totalSeconds % 30;
//   const refundAmount =
//     (totalSeconds - thirtySecondRoundoff) * private_stream_cost_per_second;
//   ivs_credits += refundAmount;
// };
const handlePrivateStreamEnd = async (self = true) => {
  if (self == false) {
    document.getElementById("private-video-player").remove();
    insertPrivateStreamImage("./assets/waiting-for-streamer.png");
    showPrettyModal(
      "Private Stream Ended",
      "The streamer has ended the private stream and public stream is loading."
    );
    return;
  }
  deletePrettyModal();
  clearInterval(elapsed_time_interval);
  document.getElementById("elapsed-time").innerText = `Elapsed Time: 0:0`;
  elapsed_time = 0;
  isAlreadyShown = false;
  document.getElementById("player-controls").style.display = "block";
  document.getElementById("private-player-controls").style.display = "none";
  document
    .getElementById("private")
    .querySelector("span:first-child").textContent = "Go Private";
  private_view_active = false;
  document.getElementById("inputContainer").style.display = "flex";
  document.getElementById("privateInputContainer").style.display = "none";
  if (!self) {
    showPrettyModal(
      "Private Stream Ended",
      "The streamer has ended the private stream and you are now back to public stream."
    );
  }
  if (document.getElementById("private-banner")) {
    document.getElementById("private-banner").remove();
  }
  if (self) {
    insertImage(placeholderUrl + "private.png");
    await send_event(
      region,
      secretAccessKey,
      secretAccessId,
      channel_id_private,
      "viewer-ended"
    );
  }
  warned = false;
  document.getElementById("private-video-player").remove();
  privateConnection.close();
  privateConnection.removeEventListener("open", privateChatSocketListener);
  privatePlayer.removeEventListener(
    IVSPlayer.PlayerEventType.ERROR,
    handlePrivateStreamError
  );
  privatePlayer.removeEventListener(
    IVSPlayer.PlayerState.PLAYING,
    handlePrivateStreamPlaying
  );
  document.getElementById("messages").style.display = "flex";
  document.getElementById("privateMessages").style.display = "none";
  console.log("Private Player Unmounted");
  document.getElementById("requestButton-container").innerHTML = `
  <button
      id="requestButton"
      onclick="requestPrivateStream()"
    >
    Watch Private Stream
    </button>
  `;
};
const updateCreditSelection = selectedRadio => {
  const creditValue = parseInt(selectedRadio.value);
  creditOptionSelected = creditValue;
  updateExtraTime();
};
const updateExtraTime = () => {
  const extraTime =
    (creditOptionSelected * 30) / private_stream_cost_per_second;
  const extraMinutes = Math.floor(extraTime / 60);
  const extraSeconds = Math.floor(extraTime % 60);
  document.getElementById(
    "extra-time"
  ).innerText = `Extra Time You Will Get: ${extraMinutes}:${
    extraSeconds < 10 ? "0" : ""
  }${extraSeconds}`;
};
const buyCredits = async () => {
  await send_event_with_attributes(
    region,
    secretAccessKey,
    secretAccessId,
    channel_id_private,
    "buy-credits",
    {
      extraTime: (
        (creditOptionSelected * 30) /
        private_stream_cost_per_second
      ).toString(),
    }
  );
  ivs_credits += creditOptionSelected;
  updateCreditRelatedUI();
  // document.getElementById("credits-left").innerText = ivs_credits;
  setTimeout(() => {
    warned = false;
  }, 2000);
  deletePrettyModal();
};
const buyMoreCreditsModal = async () => {
  // await send_event(
  //   region,
  //   secretAccessKey,
  //   secretAccessId,
  //   channel_id_private,
  //   "more-credits-in-purchase"
  // );
  const prettyModal = document.createElement("div");
  prettyModal.setAttribute("id", "alert-popup");
  prettyModal.classList.add("DuKSh");
  prettyModal.classList.add("EJVsl");
  prettyModal.classList.add("OtrSK");
  prettyModal.classList.add("cNGwx");
  prettyModal.classList.add("gsCWf");
  prettyModal.style.backgroundColor = "rgba(0, 170, 255, 0.58)";
  prettyModal.innerHTML = `
   <div class="GodhZ gsCWf EJVsl OtrSK CzomY">
                <div class="ExGby HruDj">
                    <div class="tSrNa gsCWf EJVsl zsSLy">
                        <h1 class="USKIn">Low Credits!</h1>
                        <div class="wcrwV gsCWf EJVsl">
                            <div class="AYaOY TNIio UYvZu gsCWf EJVsl OtrSK DeYlt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="TImJU">
                    <p>You are running low on credits. Please buy more credits to keep watching this private stream</p>
                    <br>
                    
                    <fieldset id="group2">
                      <input checked onclick="updateCreditSelection(this);"  type="radio" id="o1" value="50" name="credit-group">
                      <label for="o1">50 Credits</label><br>
                      <input onclick="updateCreditSelection(this);" type="radio" id="o2" value="100" name="credit-group">
                      <label for="o2">100 Credits</label><br>
                      <input onclick="updateCreditSelection(this);" type="radio" id="o3" value="200" name="credit-group">
                      <label for="o3">200 Credits</label><br>
                    </fieldset>
                    <p id='extra-time'></p>
                    <br>
                    <br>
                    <div style="display:flex;">
                    <button class="AYaOY" onclick="buyCredits()">Buy Credits</button>
                    <button style="margin-left:10px;" onclick="deletePrettyModal()" class="AYaOY">Cancel</button>
                    </div>
                    </div>
                </div>
            </div>
  `;
  document.getElementsByClassName("wrapper")[0].append(prettyModal);

  updateExtraTime();
};

// ----
{
  /* <div class="DuKSh EJVsl OtrSK cNGwx gsCWf" id="alert-popup" style="background-color: rgba(0, 170, 255, 0.58);">
   <div class="GodhZ gsCWf EJVsl OtrSK CzomY">
                <div class="ExGby HruDj">
                    <div class="tSrNa gsCWf EJVsl zsSLy">
                        <h1 class="USKIn">Alert!</h1>
                        <div class="wcrwV gsCWf EJVsl">
                            <div class="AYaOY TNIio UYvZu gsCWf EJVsl OtrSK DeYlt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="TImJU">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ab aliquam beatae blanditiis culpa, debitis
                        deserunt harum incidunt nemo quae quaerat quasi
                        quibusdam quidem, reiciendis, sapiente tempore velit
                        voluptatum. Ipsa, repellat!
                        <br>
                        <br>
                        <button class="AYaOY">OK</button>
                    </div>
                </div>
            </div>
        </div> */
}
