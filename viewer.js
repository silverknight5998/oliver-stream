const region = "us-east-1";
const secretAccessKey = "OKTAIWBPWhXweY059wfv5Fy52eToiN8SG3kHeA+B";
const secretAccessId = "AKIA2GRP3G4SOW74LRUJ";
let channel_arn_public =
  "arn:aws:ivschat:us-east-1:701253760804:room/KkXuKTm9fqjz";
let channelConnection;
let privateConnection;
let channels;
let arn, ClientToken, userName, streamArn;
const placeholderUrl =
  "https://fs.codelinden.com/wp-content/plugins/fansocial/assets/img/placeholder/";
const player = IVSPlayer.create();
const PlayerState = IVSPlayer.PlayerState;
const PlayerEventType = IVSPlayer.PlayerEventType;
const videoPlayer = document.getElementById("video-player");
const playerOverlay = document.getElementById("overlay");
const playerControls = document.getElementById("player-controls");
const btnPlay = document.getElementById("play");
const btnMute = document.getElementById("mute");
const btnSettings = document.getElementById("settings");
const settingsMenu = document.getElementById("settings-menu");
let paused = false;
let messageUserId;
let bannedWords = [];
let playing = false;
let ivs_credits = 100;
let ivs_credits_used = 0;
let private_stream_cost_per_second = 1,
  private_stream_cost_view_total = 0;
let private_seconds_viewed = 0;
let private_cost_deducted = 0;
let private_view_active = false;
let roomRules = "";
let updateViewerCountInterval;
let viewerName = "basit";
let total_donations = 0;
const toasts = new Toasts({
  width: 400,
  timing: "ease",
  duration: "0.5s",
  dimOld: false,
  position: "top-right",
});

// Function to create and show a toast
function showToast(title, content, style) {
  toasts.push({
    title: title,
    content: content,
    style: style,
  });
}
const unMuteOnLoad = () => {
  btnMute.click();
  document.removeEventListener("click", unMuteOnLoad);
};
player.addEventListener(PlayerEventType.AUDIO_BLOCKED, function () {
  setBtnMute();
  console.log("Player Event - AUDIO_BLOCKED");
  document.addEventListener("click", unMuteOnLoad);
});
let setBtnPaused = function () {
  btnPlay.classList.remove("btn--play");
  btnPlay.classList.add("btn--pause");
};

let setBtnPlay = function () {
  btnPlay.classList.add("btn--play");
  btnPlay.classList.remove("btn--pause");
};

let setBtnMute = function () {
  btnMute.classList.remove("btn--mute");
  btnMute.classList.add("btn--unmute");
};

let setBtnUnmute = function () {
  btnMute.classList.add("btn--mute");
  btnMute.classList.remove("btn--unmute");
};
playerOverlay.addEventListener(
  "mouseover",
  function (e) {
    if (playing || private_view_active) {
      playerOverlay.classList.add("player--hover");
    }
  },
  false
);
playerOverlay.addEventListener("mouseout", function (e) {
  playerOverlay.classList.remove("player--hover");
});
player.addEventListener(PlayerState.READY, function () {
  console.log("Player State - READY");
});
player.addEventListener(PlayerState.BUFFERING, function () {
  console.log("Player State - BUFFERING");
  if (paused) return;

  if (document.getElementById("statusImage")) {
    document.getElementById("statusImage").remove();
  }
  document.getElementById("loader").style.display = "block";
});
player.addEventListener(PlayerState.IDLE, function () {
  console.log("Player State - IDLE");
  // document.getElementById("loader").style.display = "block";
  // if (document.getElementById("statusImage")) {
  //   document.getElementById("statusImage").remove();
  // }
});
const endPrivateIfActive = async () => {
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

  if (document.getElementById("private-banner")) {
    document.getElementById("private-banner").remove();
  }
  var element = document.getElementById("statusPrivateImage");
  if (typeof element != "undefined" && element != null) {
    element.remove();
  }
  warned = false;
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
player.addEventListener(PlayerState.PLAYING, function () {
  console.log("called");
  if (private_view_active) {
    endPrivateIfActive();
  }
  showControlsAndHideOffline();
  HideViewShowRequest();
  renderGoals();
  clearInterval(updateViewerCountInterval);
  updateViewerCountInterval = setInterval(() => {
    get_stream_information(region, secretAccessKey, secretAccessId, streamArn)
      .then(response => {
        // console.log({ ViewerCount: response.stream.viewerCount });
        document.getElementsByClassName(
          "viewers-count"
        )[0].innerHTML = `${response.stream.viewerCount} watching`;
        // console.log({ "Stream Health": response.stream.health });
        // console.log({ state: response.stream.state });
      })
      .catch(err => {
        document.getElementsByClassName("viewers-count")[0].innerHTML = ``;
        console.log({ err });
      });
  }, 3000);
  playing = true;
  document.getElementById("overlay").style.backgroundColor = "transparent";
  document.getElementById("loader").style.display = "none";
  if (paused) return;

  console.log("Player State - PLAYING");
  const vHeight = document
    .getElementById("video-player")
    .getBoundingClientRect();
  console.log({ vHeight });
  // document.getElementById("video-wrapper-top").style.height =
  //   vHeight.height + "px";
  // document.getElementById("viewPrivate").disabled = true;
  document.getElementById("sendButton").disabled = false;
  // document.getElementById("textBox").disabled = false;
  if (document.getElementById("requestButton")) {
    document.getElementById("requestButton").disabled = false;
  }
  if (document.getElementById("statusImage")) {
    document.getElementById("statusImage").remove();
  }
  // document.getElementById("streamStatus").innerText = "Stream Status: Active";
});
player.addEventListener(PlayerState.ENDED, function () {
  clearInterval(updateViewerCountInterval);
  HideViewShowRequest();
  document.getElementById("loader").style.display = "none";
  hideControlsAndShowOffline();
  paused = false;
  //   document.getElementById("video-player").remove();
  document.getElementById("sendButton").disabled = true;
  // document.getElementById("textBox").disabled = true;
  if (document.getElementById("requestButton"))
    document.getElementById("requestButton").disabled = true;
  console.log("Player State - ENDED");
  // document.getElementById("streamStatus").innerText = "";
  insertImage(placeholderUrl + "offline.jpeg");
  playing = false;
});
player.addEventListener(PlayerEventType.ERROR, async function (err) {
  const vplayer = document.getElementById("video-player");
  clearInterval(updateViewerCountInterval);

  //   if (typeof vplayer != "undefined" && vplayer != null) {
  //   }
  paused = false;
  await send_event(
    region,
    secretAccessKey,
    secretAccessId,
    arn,
    "playback-request"
  );
  // console.warn("Something Went  - ERROR:", err);
  //   document.getElementById("streamStatus").innerText = "";
  //   vplayer.remove();
  insertImage(placeholderUrl + "offline.jpeg");
  document.getElementById("loader").style.display = "none";

  playing = false;
});
btnPlay.addEventListener(
  "click",
  function (e) {
    if (btnPlay.classList.contains("btn--play")) {
      // change to pause
      setBtnPaused();
      player.pause();
    } else {
      // change to play
      setBtnPlay();
      player.play();
    }
  },
  false
);
// Mute/Unmute
btnMute.addEventListener(
  "click",
  function (e) {
    if (btnMute.classList.contains("btn--mute")) {
      setBtnMute();
      player.setMuted(1);
    } else {
      setBtnUnmute();
      player.setMuted(0);
    }
  },
  false
);
// Create Quality Options
let createQualityOptions = function (obj, i) {
  let q = document.createElement("a");
  let qText = document.createTextNode(obj.name);
  settingsMenu.appendChild(q);
  q.classList.add("settings-menu-item");
  q.appendChild(qText);

  q.addEventListener("click", event => {
    player.setQuality(obj);
    closeSettingsMenu();
    return false;
  });
};

// Close Settings menu
let closeSettingsMenu = function () {
  btnSettings.classList.remove("btn--settings-on");
  btnSettings.classList.add("btn--settings-off");
  settingsMenu.classList.remove("open");
};

// Settings
btnSettings.addEventListener(
  "click",
  function (e) {
    let qualities = player.getQualities();
    let currentQuality = player.getQuality();

    // Empty Settings menu
    while (settingsMenu.firstChild)
      settingsMenu.removeChild(settingsMenu.firstChild);

    if (btnSettings.classList.contains("btn--settings-off")) {
      for (var i = 0; i < qualities.length; i++) {
        createQualityOptions(qualities[i], i);
      }
      btnSettings.classList.remove("btn--settings-off");
      btnSettings.classList.add("btn--settings-on");
      settingsMenu.classList.add("open");
    } else {
      closeSettingsMenu();
    }
  },
  false
);

// Close Settings menu if user clicks outside the player
window.addEventListener("click", function (e) {
  if (playerOverlay.contains(e.target)) {
  } else {
    closeSettingsMenu();
  }
});
const hideControlsAndShowOffline = () => {
  document.getElementById("chat-tab").style.display = "none";
  document.getElementsByClassName("tab-buttons")[0].style.display = "none";
  document.getElementsByClassName("page-content-container")[0].style.display =
    "none";
  document.getElementById("offline").style.display = "flex";
};
const showControlsAndHideOffline = () => {
  document.getElementById("chat-tab").style.display = "block";
  document.getElementsByClassName("tab-buttons")[0].style.display = "flex";
  document.getElementsByClassName("page-content-container")[0].style.display =
    "block";
  document.getElementById("offline").style.display = "none";
};

const insertImage = src => {
  var element = document.getElementById("statusImage");
  if (typeof element != "undefined" && element != null) {
    element.remove();
  }
  const imageElement = document.createElement("img");
  imageElement.style = "width:100%;height:100%;position:absolute;z-index:8;";
  imageElement.setAttribute("id", "statusImage");
  imageElement.src = src;
  document.getElementById("video-section").appendChild(imageElement);
};
const handleStreamEnd = () => {
  if (paused) {
    document.getElementById("sendButton").disabled = true;
    document.getElementById("textBox").disabled = true;
    HideViewShowRequest();
    document.getElementById("requestButton").disabled = true;
    console.log("Player State - ENDED");
    document.getElementById("streamStatus").innerText = "";
    insertImage(placeholderUrl + "offline.jpeg");
    playing = false;
    paused = false;
  }
  //   document.getElementById("sendButton").disabled = true;
  // document.getElementById("requestButton").disabled = true;
  // document.getElementById("streamStatus").innerText = "";
  //   playing = false;
  //   insertImage("./assets/offline.jpeg");
  // document.getElementById("video-player").remove();
};
const insertStreamPlayback = () => {
  const videoElement = document.createElement("video");
  videoElement.setAttribute("id", "video-player");
  videoElement.style =
    "width: 100%;position: absolute;top: 0;background: #000;border-radius: var(--radius);";
  document.getElementById("video-section").appendChild(videoElement);
  if (IVSPlayer.isPlayerSupported) {
    player.attachHTMLVideoElement(document.getElementById("video-player"));
    try {
      player.load(
        "https://562d3781dc12.us-east-1.playback.live-video.net/api/video/v1/us-east-1.701253760804.channel.QUO1ToasohoT.m3u8"
      );
      player.play();
    } catch (err) {
      playing = false;
      // console.log({ "Error In Playback": err });
    }
  }
};
const retyInsertStreamPlayback = () => {
  var element = document.getElementById("video-player");
  if (typeof element != "undefined" && element != null) {
    element.remove();
  }
  const videoElement = document.createElement("video");
  videoElement.setAttribute("id", "video-player");
  videoElement.style =
    "width: 100%;position: absolute;top: 0;background: #000;border-radius: var(--radius);";
  document.getElementById("video-section").appendChild(videoElement);
  if (IVSPlayer.isPlayerSupported) {
    player.attachHTMLVideoElement(document.getElementById("video-player"));
    try {
      player.load(
        "https://562d3781dc12.us-east-1.playback.live-video.net/api/video/v1/us-east-1.701253760804.channel.QUO1ToasohoT.m3u8"
      );
      player.play();
      playing = true;
    } catch (err) {
      playing = false;
      // console.log({ "Error In Playback": err });
    }
  }
};
const handleRoomRulesUpdate = rules => {
  roomRules = rules;
  roomRules = roomRules.replace(/= @ _ \/ -/g, "<br>");
  document.getElementById("room-rules").innerHTML =
    "<h4 style='margin:0;'>Room Rules</h4>";
  document.getElementById(
    "room-rules"
  ).innerHTML += `<p style='margin:0;font-size:16px;'>${roomRules}</p>`;
};
const updateCreditRelatedUI = () => {
  document.getElementById("private-stream-request-text").innerHTML = `
  Available Credits: <b>${ivs_credits}</b><br>
  Price Per 30 Seconds: <b>${private_stream_cost_per_second}</b> Credits<br>`;
  document.getElementsByClassName(
    "token-container"
  )[0].innerText = `${ivs_credits} Tokens Credit | ${private_stream_cost_per_second} Tokens / 30sec`;
  document.getElementById("wallet_description").innerHTML = `
  Your Wallet contains have <b>${ivs_credits}</b> Credits right now.
  You can use these credits to view private streams.
  You can buy more credits by clicking on the button below.
  `;
};
const join_channel = async () => {
  const roomDetails = await get_room(
    region,
    secretAccessKey,
    secretAccessId,
    channel_arn_public
  );
  console.log({ roomDetails });
  streamArn = roomDetails.tags.streamArn;
  private_stream_cost_per_second = parseFloat(roomDetails.tags["private-cost"]);
  private_stream_cost_view_total = parseFloat(
    roomDetails.tags["private-view-cost"]
  );
  document.getElementById("description-txt").innerText =
    roomDetails.tags["description"] || "";
  updateCreditRelatedUI();
  console.log({ streamArn });
  try {
    const privateStreamInfo = await get_stream_information(
      region,
      secretAccessKey,
      secretAccessId,
      roomDetails.tags.privateStreamArn
    );
    console.log({ privateStreamInfo });
    await insertStreamPlayback();
    if (roomDetails.tags.status == "private") {
      handleStreamInPrivateSession();
      HideRequestShowView();
      // document.getElementById("viewPrivate").disabled = false;
      paused = true;
    }
    if (roomDetails.tags.status == "paused") {
      handleStreamPaused();
      paused = true;
    }

    await renderGoals();

    const messages_list = await db_scan(
      region, // Replace with your chatroom region
      secretAccessKey, // Replace with your secret access key
      secretAccessId, // Replace with your secret key id
      "oliverdb"
    );
    console.log({ messages_list });
    messages_list.Items.sort((a, b) => {
      return a.id.S - b.id.S;
    });
    messages_list.Items.forEach(item => {
      createMessage(item.message.S);
    });
    FetchAndRenderTags();
  } catch (err) {
    try {
      const streamInfo = await get_stream_information(
        region,
        secretAccessKey,
        secretAccessId,
        streamArn
      );
      console.log({ streamInfo });
      if (streamInfo.stream.health == "STARVING") {
        console.log("STREAM OFFLINE HERE?");
        insertImage(placeholderUrl + "offline.jpeg");
        document.getElementById("loader").style.display = "none";
        hideControlsAndShowOffline();
        playing = false;
      } else {
        await insertStreamPlayback();
        if (roomDetails.tags.status == "paused") {
          handleStreamPaused();
          paused = true;
        }
        await renderGoals();

        const messages_list = await db_scan(
          region, // Replace with your chatroom region
          secretAccessKey, // Replace with your secret access key
          secretAccessId, // Replace with your secret key id
          "oliverdb"
        );
        console.log({ messages_list });
        messages_list.Items.sort((a, b) => {
          return a.id.S - b.id.S;
        });
        messages_list.Items.forEach(item => {
          createMessage(item.message.S);
        });
        FetchAndRenderTags();
      }
    } catch (err) {
      console.log({ err });
      console.log("STREAM OFFLINE HERE actual");
      insertImage(placeholderUrl + "offline.jpeg");
      document.getElementById("loader").style.display = "none";
      playing = false;
      hideControlsAndShowOffline();
    }
  }
  // ----- DANGER ZONE -----
  const { id: channelIdTemp } = roomDetails;
  const userIdTemp = Math.floor(Math.random() * 1000000000).toString();
  // const isBannedResponse = await fetch(
  //   `https://bha5r5z7kwn3tjgwnpjrupwpma0hlktb.lambda-url.us-east-1.on.aws?channelId=${channelIdTemp}&userId=${userIdTemp}`
  // );
  // const isBanned = await isBannedResponse.json();
  // console.log({ isBanned });
  // -----
  const channel_arn = roomDetails.arn;
  arn = channel_arn;
  let userChatName = "viewer";
  userName = userChatName;
  // if (roomDetails.tags.active == "false") {
  //   // handleStreamPaused();
  // }

  //   document.getElementById("channelsList").remove();
  // document.getElementById("messageBox").style.visibility = "visible";
  document.getElementsByClassName("stream-title")[0].innerText =
    roomDetails.name;
  roomRules = roomDetails.tags["room-rules"] || "";
  roomRules = roomRules.replace(/= @ _ \/ -/g, "<br>");
  document.getElementById("room-rules").innerHTML =
    "<h4 style='margin:0;'>Room Rules</h4>";
  document.getElementById("room-rules").innerHTML = roomRules;
  //   await renderGoals();
  updateTipRelatedUI();
  const donations = await get_donations(
    region,
    secretAccessKey,
    secretAccessId,
    channel_arn_public
  );
  console.log({ donations });

  const { connection, chatClientToken, userId } = await open_channel(
    channel_arn,
    userChatName,
    region, // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId // Replace with your secret key id
  );
  messageUserId = userId;
  ClientToken = chatClientToken;
  channelConnection = connection;
  console.log({ channelConnection, connection });

  connection.addEventListener("open", () => {
    console.log("Connection established!");

    connection.onmessage = event => {
      const data = JSON.parse(event.data);

      if (data.Type == "MESSAGE") {
        if (data.Sender.UserId != messageUserId) {
          //`${data.Sender.Attributes.displayName}:
          createMessage(` ${data.Content}`);
        }
      }
      if (data.Type == "EVENT" && data.Attributes?.type == "notification") {
        alert(`NOTIFICATION:: ${data.EventName}`);
      }
      if (
        data.Type == "EVENT" &&
        data.EventName == "channel-description-update"
      ) {
        showToast(
          "Description Update",
          data.Attributes["description"],
          "success"
        );
        document.getElementById("description-txt").innerText =
          data.Attributes["description"];
      }
      if (data.Type == "EVENT" && data.EventName == "goal-completed") {
        showToast("Goal Update", data.Attributes["data"], "success");
        createMessage(data.Attributes["data"]);
      }
      if (data.Type == "EVENT" && data.EventName == "delete-channel") {
        handleStreamEnd();
      }
      if (data.Type == "EVENT" && data.EventName == "pause-channel") {
        handleStreamPaused();
      }
      if (data.Type == "EVENT" && data.EventName == "private-channel-start") {
        // handleStreamInPrivateSession();
      }
      if (data.Type == "EVENT" && data.EventName == "continue-channel") {
        handleStreamContinue();
      }
      if (data.Type == "EVENT" && data.EventName == "invite-accepted") {
        handleChatInviteAccept(data);
      }
      if (data.Type == "EVENT" && data.EventName == "room-rules-update") {
        handleRoomRulesUpdate(data.Attributes["room-rules"]);
        showToast("Alert", `Room rules updated by the streamer`, "success");
        createMessage(`Room rules updated by the streamer`);
      }
      if (data.Type == "EVENT" && data.EventName == "tip-event") {
        updateTipRelatedUI();
      }

      if (data.Type == "EVENT" && data.EventName == "invite-declined") {
        handleChatInviteDecline(data);
      }
      if (data.Type == "EVENT" && data.EventName == "channel-name-update") {
        showToast("Channel Name Update", data.Attributes["name"], "success");
        createMessage("Channel Name Updated");
        document.getElementsByClassName("stream-title")[0].innerText =
          data.Attributes["name"];
      }
      if (data.Type == "EVENT" && data.EventName == "stream-start") {
        paused = false;
        // document.getElementById("messages").innerHTML = "";
        // document.getElementById("streamTags").innerHTML = "Stream Tags:";
        // document.getElementById
        renderGoals();
        retyInsertStreamPlayback();
      }
      if (data.Type == "EVENT" && data.EventName == "private-price-update") {
        if (data.Attributes.newPrice != private_stream_cost_per_second) {
          showToast(
            "Private Price Update",
            `Private Price Updated to ${data.Attributes.newPrice} Credits Per 30 Seconds`,
            "success"
          );
          createMessage(
            `Private Price Updated to ${data.Attributes.newPrice} Credits Per 30 Seconds`
          );
        }
        if (private_stream_cost_view_total != data.Attributes.newPriceView) {
          showToast(
            "Private Price Update",
            `Private Price Updated to ${data.Attributes.newPriceView} Credits For Viewing`,
            "success"
          );
          createMessage(
            `Private Price Updated to ${data.Attributes.newPriceView} Credits For Viewing`
          );
        }
        private_stream_cost_per_second = parseFloat(data.Attributes.newPrice);
        private_stream_cost_view_total = parseFloat(
          data.Attributes.newPriceView
        );
        updateCreditRelatedUI();
      }
      if (data.Type == "EVENT" && data.EventName == "goals-updated") {
        renderGoals();
        createMessage("|| Goals Updated By Streamer ||");
        showToast("Goal Update", "Goals Updated By Streamer", "success");
      }
      if (data.Type == "EVENT" && data.EventName == "updated-tags") {
        // handleTagUpdate(data);
      }
      if (data.Type == "EVENT" && data.EventName == "playback-accepted") {
        retyInsertStreamPlayback();
      }
      //"stream-start-after-private"
      if (
        data.Type == "EVENT" &&
        data.EventName == "stream-start-after-private"
      ) {
        paused = false;
        // document.getElementById("messages").innerHTML = "";
        // document.getElementById("streamTags").innerHTML = "Stream Tags:";

        renderGoals();
        retyInsertStreamPlayback();
      }
      if (data.Type == "EVENT") {
        console.log(data.EventName);
        // createMessage(`NOTIFICATION:: ${data.EventName}`);
      }
    };
  });
};
const FetchAndRenderTags = async () => {
  let roomDetails = await get_stream_channel(
    region,
    secretAccessKey,
    secretAccessId,
    streamArn
  );
  console.log({ roomDetails });
  roomDetails = roomDetails.channel;
};
const handleTagUpdate = async data => {
  document.getElementById("streamTags").innerHTML = "Stream Tags: ";
  for (let key in data.Attributes) {
    document.getElementById("streamTags").innerHTML += key + "&nbsp;";
  }
};
const tipStreamer = async tipAmount => {
  deletePrettyModal();
  await add_donation(
    region,
    secretAccessKey,
    secretAccessId,
    channel_arn_public,
    tipAmount.toString(),
    viewerName
  );
  showToast("Tip", "Your tip has been sent to the streamer.", "success");

  // showPrettyModal("Success!", "Your tip has been sent to the streamer.");
  ivs_credits -= tipAmount;
  await send_event_with_attributes(
    region,
    secretAccessKey,
    secretAccessId,
    arn,
    "tip-event",
    {
      tipMessage: `${viewerName} tipped ${tipAmount} credits.`,
    }
  );
  updateCreditRelatedUI();
  updateTipRelatedUI();
};
const updateTipRelatedUI = async () => {
  const tips = await get_donations(
    region,
    secretAccessKey,
    secretAccessId,
    channel_arn_public
  );
  total_donations = 0;
  let highest_tipper = "";
  let highest_tip = 0;
  tips.forEach(tip => {
    total_donations += parseFloat(tip.donation.S);
    if (parseFloat(tip.donation.S) > highest_tip) {
      highest_tipper = tip.name.S;
      highest_tip = parseFloat(tip.donation.S);
    }
  });
  renderGoals();

  if (tips.length == 0) {
    document.getElementById("latest-tipper-name-span").innerText =
      "No Tips Yet";
    document.getElementById("highest-tipper-name-span").innerText =
      "No Tips Yet";
    return;
  }
  let recent_tipper = tips[0].name.S;
  document.getElementById("latest-tipper-name-span").innerText = recent_tipper;
  document.getElementById("highest-tipper-name-span").innerText =
    highest_tipper;
  console.log({ total_donations });
  console.log({ tips });
};
const handleTipSubmission = async buttonId => {
  if (buttonId.id > ivs_credits) {
    showPrettyModal(
      "Error!",
      "You don't have enough credits to tip this amount. Please purchase more credits."
    );
  } else {
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
                        <h1 class="USKIn">Tip Confirmation</h1>
                        <div class="wcrwV gsCWf EJVsl">
                            <div class="AYaOY TNIio UYvZu gsCWf EJVsl OtrSK DeYlt">
                                <svg onclick="deletePrettyModal()"                                
                                width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="TImJU">
                        <p>Are you sure you want to donate ${buttonId.id} credits to this streamer?</p>
                        <br>
                        <br>
                        <div style="display:flex;">
                        <button class="AYaOY" onclick="tipStreamer(${buttonId.id})">Confirm</button>
                        <button style="margin-left:10px;" onclick="deletePrettyModal()" class="AYaOY">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
  `;
    document.getElementsByClassName("wrapper")[0].append(prettyModal);
  }
};
const videoWrapper = document.getElementsByClassName("player-wrapper")[0];
const observer = new IntersectionObserver(entries => {
  if (!playing) return;
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      console.log("not visible");
      videoWrapper.style.position = "fixed";
      videoWrapper.style.bottom = "0";
      videoWrapper.style.margin = "20px";
      videoWrapper.style.right = "0";
      videoWrapper.style.width = window.innerWidth * 0.2 + "px";
      // videoWrapper.style.height = "20%";
    } else if (entry.isIntersecting) {
      console.log("visible");
    }
  });
});
const renderGoals = async () => {
  document.getElementById("progress").style.display = "none";
  document.getElementsByClassName("progress-status")[0].innerHTML = ``;
  document.getElementsByClassName("goal-description")[0].innerText = "";
  // document.getElementById(
  //   "description-txt"
  // ).innerText = `Total Donations: ${total_donations}`;
  const goals = await get_goals(
    region, // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId, // Replace with your secret key id
    "oliverdb"
  );
  console.log({ goals });
  const sortedByAmount = goals.sort((a, b) => {
    return parseInt(b.amount.N) - parseInt(a.amount.N);
  });
  for (let i = sortedByAmount.length - 1; i >= 0; i--) {
    console.log({ tst: sortedByAmount[i] });
    if (parseInt(sortedByAmount[i].amount.N) <= total_donations) {
      document.getElementsByClassName("progress-status")[0].innerHTML = `
        <span class="progress-percentage">Complete</span>`;
      document.getElementsByClassName("goal-description")[0].innerText =
        "Goal: " + sortedByAmount[i].name.S;
      updateProgressBar(total_donations, parseInt(sortedByAmount[i].amount.N));
      continue;
    }

    document.getElementById("progress").style.display = "block";
    if (sortedByAmount[i].completed.N == "0") {
      document.getElementsByClassName("progress-status")[0].innerHTML = `
        <span class="progress-percentage">${total_donations}
        </span>/<span class="progress-tokens">${sortedByAmount[i].amount.N}</span> Tokens`;
      document.getElementsByClassName("goal-description")[0].innerText =
        "Goal: " + sortedByAmount[i].name.S;
      updateProgressBar(total_donations, parseInt(sortedByAmount[i].amount.N));
      break;
    } else {
      document.getElementsByClassName("progress-status")[0].innerHTML = `
        <span class="progress-percentage">Complete</span>`;
      document.getElementsByClassName("goal-description")[0].innerText =
        "Goal: " + sortedByAmount[i].name.S;
      updateProgressBar(total_donations, parseInt(sortedByAmount[i].amount.N));
      break;
    }
  }
};
const HideRequestShowView = () => {
  document.getElementById("private-stream-view-text-total").innerHTML = `
  Available Credits: <b>${ivs_credits}</b><br>
  Price Per 30 Seconds: <b>${private_stream_cost_view_total}</b> Credits<br>`;
  document.getElementById("private-stream-request").style.display = "none";
  document.getElementById("private-stream-view").style.display = "block";
};
const HideViewShowRequest = () => {
  document.getElementById("private-stream-request-text").innerHTML = `
  Available Credits: <b>${ivs_credits}</b><br>
  Price Per 30 Seconds: <b>${private_stream_cost_per_second}</b> Credits<br>`;
  document.getElementById("private-stream-request").style.display = "block";
  document.getElementById("private-stream-view").style.display = "none";
};
const handleStreamInPrivateSession = async () => {
  await player.pause();
  clearInterval(updateViewerCountInterval);
  document.getElementById("loader").style.display = "none";
  // console.log("stream in private session");
  // document.getElementById("sendButton").disabled = true;
  // // document.getElementById("textBox").disabled = true;
  // // document.getElementById("streamStatus").innerText = "";
  insertImage(placeholderUrl + "private.png");
  // // document.getElementById("viewPrivate").disabled = false;
  playing = false;
  paused = true;
};
const handleStreamPaused = async () => {
  await player.pause();
  document.getElementById("loader").style.display = "none";
  console.log("stream paused");
  document.getElementById("sendButton").disabled = true;
  // document.getElementById("textBox").disabled = true;
  // document.getElementById("streamStatus").innerText = "";
  // document.getElementById("video-player").remove();
  insertImage(placeholderUrl + "pause.jpeg");
  playing = false;
  paused = true;
};
const handleStreamContinue = () => {
  document.getElementById("sendButton").disabled = false;
  // document.getElementById("textBox").disabled = false;
  document.getElementById("requestButton").disabled = false;

  playing = true;
  if (document.getElementById("statusImage")) {
    document.getElementById("statusImage").remove();
  }
  // retyInsertStreamPlayback();
  player.play();
  paused = false;
};
const createEmptyModal = () => {
  const modalContainer = document.createElement("div");
  modalContainer.setAttribute("id", "modal");
  modalContainer.setAttribute("class", "modal");
  const modalContent = document.createElement("div");
  modalContent.setAttribute("class", "modal-content-full");
  modalContainer.style.display = "block";
  window.onclick = function (event) {
    if (event.target == modalContainer) {
      deleteEmptyModal();
    }
  };
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);
};
function credit_input_onchange(e) {
  ivs_credits_used = e.value;
  document.getElementById(
    "total_stream_time"
  ).innerText = `Total Stream Time You'll get: ${parseInt(
    parseInt(ivs_credits_used) / private_stream_cost_per_second
  )} seconds`;
  if (
    parseInt(ivs_credits_used) <= ivs_credits &&
    parseInt(ivs_credits_used) >= private_stream_cost_per_second
  ) {
    document.getElementById("credit_warning").style.display = "none";
    document.getElementById("send_private_stream_request").disabled = false;
  } else {
    document.getElementById("credit_warning").style.display = "block";
    document.getElementById("send_private_stream_request").disabled = true;
  }
}
const deleteEmptyModal = () => {
  document.getElementById("modal").remove();
};
const deletePrettyModal = () => {
  if (document.getElementById("alert-popup")) {
    document.getElementById("alert-popup").remove();
  }
};
const showPrettyModal = (title, content) => {
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
                        <h1 class="USKIn">${title}</h1>
                        <div class="wcrwV gsCWf EJVsl">
                            <div class="AYaOY TNIio UYvZu gsCWf EJVsl OtrSK DeYlt">
                                <svg onclick="deletePrettyModal()"                                
                                width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="TImJU">
                        <p>${content}</p>
                        <br>
                        <br>
                        <button
                        onclick="deletePrettyModal()"
                        class="AYaOY">OK</button>
                    </div>
                </div>
            </div>
  `;
  document.getElementsByClassName("wrapper")[0].append(prettyModal);
};
const requestPrivateStream = async () => {
  if (private_stream_cost_per_second > ivs_credits) {
    showPrettyModal(
      "Error",
      "You wallet doesn't have enough credits to request a private stream.<br/>Buy More Credits to request a private stream."
    );
    return;
  }
  document.getElementById("requestButton").remove();
  // requestButton-container
  document.getElementById("requestButton-container").innerHTML = `
    <div id="requestLoader" class="loader"><div></div></div>
  `;
  send_private_stream_request();
  return;
};
const start_view_private_stream = async () => {
  // deleteEmptyModal();
  start_private_stream_for_others();
};
const viewPrivateStream = async () => {
  createEmptyModal();
  const modalContent = document.getElementsByClassName("modal-content-full")[0];
  const newElement = document.createElement("div");
  newElement.style.margin = "10px";
  newElement.innerHTML = `<h2>View Private Stream</h2>
  Available Credits : ${ivs_credits}
  <br/>
  Cost Per 30 Seconds: ${private_stream_cost_view_total}
  <br/>
  <button id="viewPrivateStreamButton" disabled onclick="start_view_private_stream()">Join Private</button>
  <button onclick="deleteEmptyModal()">Cancel</button>
  `;
  modalContent.append(newElement);
  if (ivs_credits >= private_stream_cost_view_total) {
    document.getElementById("viewPrivateStreamButton").disabled = false;
  }

  return;
};
const send_private_stream_request = async () => {
  // ivs_credits -= parseInt(document.getElementById("credits_to_be_spent").value);
  // document.getElementById("send_private_stream_request").disabled = true;
  const response = await send_event_with_attributes(
    region, // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId, // Replace with your secret key id
    arn,
    "request-private-chat",
    {
      userToken: ClientToken,
      userName: viewerName,
      credits: ivs_credits.toString(),
    }
  );
  console.log({
    response,
  });
  // document.getElementById("requestButton").disabled = true;
  // const modalContent = document.getElementsByClassName("modal-content-full")[0];
  // modalContent.innerHTML = `<div style="display:flex;justify-content:center;min-height:80px;align-items:center;"><h2>Request Sent! Waiting For Streamer</h2></div>`;
  // document.getElementById("requestButton").innerText = "Request Sent!";
};
const createMessage = text => {
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
     ${text}
    </p>
  </div>
  `;
  document.getElementsByClassName("message-container")[0].prepend(newElement);
};
const sendFunction = async () => {
  // const [result1, result2] = await Promise.all([asyncFunction1(), asyncFunction2()]);
  if (bannedWords.length == 0) {
    console.log("Getting Banned Words");
    const bannedWordsResponse = await get_banned_words(
      region, // Replace with your chatroom region
      secretAccessKey, // Replace with your secret access key
      secretAccessId // Replace with your secret key id
    );
    bannedWords = bannedWordsResponse;
  }
  // const roomStatus = await get_room(
  //   region, // Replace with your chatroom region
  //   secretAccessKey, // Replace with your secret access key
  //   secretAccessId, // Replace with your secret key id
  //   arn
  // );
  // console.log({ roomStatus });
  // if (
  //   roomStatus.tags.active == "true" &&
  //   roomStatus.tags.status == "not-paused"
  // ) {
  let message = document.getElementById("input-message").value;
  if (message == "") return;
  document.getElementById("input-message").value = "";
  message = filterMessage(message);
  createOwnMessage(message);
  send_message(channelConnection, message);
  const db_response = await db_put_item(
    region, // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId, // Replace with your secret key id
    "oliverdb",
    `Viewer: ${message}`
  );
  console.log({ db_response });
  // }
};
const createOwnMessage = text => {
  const newElement = document.createElement("div");
  newElement.classList.add("message");
  newElement.classList.add("message-right");
  newElement.innerHTML = `
  <div class="img-container">
      <img
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        alt=""
      />
    </div>
    <div class="text-container">
      <div class="message-info">
        <span class="name">You</span>
        <span class="time">3:50 PM</span>
      </div>
      <p class="text">${text}</p>
    </div>
  `;
  document.getElementsByClassName("message-container")[0].prepend(newElement);
};
const filterMessage = message => {
  const messageArray = message.split(" ");
  const filteredMessage = messageArray.map(word => {
    if (bannedWords.includes(word)) {
      return "*".repeat(word.length);
    } else {
      return word;
    }
  });
  return filteredMessage.join(" ");
};
const toggleFullScreen = () => {
  const container = document.getElementById("video-section");
  const fullscreenApi =
    container.requestFullscreen ||
    container.webkitRequestFullScreen ||
    container.mozRequestFullScreen ||
    container.msRequestFullscreen;
  if (!document.fullscreenElement) {
    fullscreenApi.call(container);
  } else {
    document.exitFullscreen();
  }
};
