let creditOptionSelected = 50;
let warned = false;
const privatePlayer = IVSPlayer.create();
let channel_id_private =
  "arn:aws:ivschat:us-east-1:701253760804:room/MjmBSFqWGelM";
const privatePlayerMarkup = `
<div class="player-wrapper">
<div class="aspect-spacer"></div>
<div id="private-video-section" class="pos-absolute full-width full-height top-0">
  <div id="private-overlay">
    <div id="private-loader" class="loader"></div>
    <div id="private-player-controls">
      <div class="player-controls__inner">
        <button id="private-play" class="btn btn--icon btn--play">
          <svg
            class="icon icon--play"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewbox="0 0 24 24"
            width="24"
          >
            <path
              d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"
            />
          </svg>
          <svg
            class="icon icon--pause"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewbox="0 0 24 24"
            width="24"
          >
            <path
              d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"
            />
          </svg>
        </button>
        <button id="private-mute" class="btn btn--icon btn--mute">
          <svg
            class="icon icon--volume_up"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewbox="0 0 24 24"
            width="24"
          >
            <path
              d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"
            />
          </svg>
          <svg
            class="icon icon--volume_off"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewbox="0 0 24 24"
            width="24"
          >
            <path
              d="M3.63 3.63c-.39.39-.39 1.02 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
            />
          </svg>
        </button>
        <button id="private-settings" class="btn btn--icon btn--settings-off">
          <svg
            class="icon icon--settings"
            height="24"
            viewbox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m0 0h24v24h-24z" fill="none" />
            <path
              d="m19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64zm-7.43 2.52c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
            />
          </svg>
        </button>
        <button
          id="private-fullscreen"
          class="btn btn--icon"
          onclick="toggleFullScreen()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#fff"
            class="bi bi-fullscreen"
            viewBox="0 0 16 16"
          >
            <path
              d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div id="private-settings-menu"></div>
  </div>
</div>
</div>
`;
const insertPrivateStreamImage = src => {
  var element = document.getElementById("statusPrivateImage");
  if (typeof element != "undefined" && element != null) {
    element.remove();
  }
  const imageElement = document.createElement("img");
  imageElement.style = "width:100%;height:100%;position:absolute;z-index:8;";
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
                        Request Private Stream
                      </button>
  `;
  }
};
const handleChatInviteAccept = data => {
  if (data.Attributes.userToken == ClientToken) {
    privateChatPopup(data.Attributes.privateChannelLink);
  } else {
    HideRequestShowView();
  }
};
const privateChatPopup = channel_id_private => {
  insertPrivateStreamImage("./assets/waiting-for-streamer.png");
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
        buyMoreCreditsModal();
        warned = true;
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
    "width: 100%;height: 100%;position: absolute;top: 0;background: #000;border-radius: var(--radius);";
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
const handlePrivateStreamPlaying = () => {
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
    document.getElementById("player-controls").innerHTML += `
      <div id="private-banner" class="player-controls__inner" style="
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
  ).innerHTML = `<button id="endPrivateStream" onclick="handlePrivateStreamEndOwn()">End Private Stream</button>`;
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
  // refundRemainingTime();

  document
    .getElementById("private")
    .querySelector("span:first-child").textContent = "Go Private";
  private_view_active = false;
  document.getElementById("inputContainer").style.display = "flex";
  document.getElementById("privateInputContainer").style.display = "none";
  insertImage("./assets/private.png");
  if (document.getElementById("private-banner")) {
    document.getElementById("private-banner").remove();
  }
  if (self) {
    await send_event(
      region,
      secretAccessKey,
      secretAccessId,
      channel_id_private,
      "viewer-ended"
    );
  }
  warned = false;
  // document.getElementById("modal").remove();
  document.getElementById("private-video-player").remove();
  privateConnection.close();
  privateConnection.removeEventListener("open", privateChatSocketListener);
  // document.getElementById("requestButton").innerText = "Request Private Chat";
  // document.getElementById("requestButton").onclick = requestPrivateStream;
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
  // privatePlayer.delete();
  document.getElementById("requestButton-container").innerHTML = `
  <button
      id="requestButton"
      onclick="requestPrivateStream()"
    >
      Request Private Stream
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
  warned = false;
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
