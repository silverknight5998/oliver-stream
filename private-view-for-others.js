let privateViewerInterval;
let waitingForFunding = false;
const button = document.getElementById("follow-btn");
const toast = document.querySelector(".toast");
const clIcon = document.querySelector(".close");
const progress = document.querySelector(".progress");
let elapsed_time_interval_others;
let elapsed_time_others = 0;
let timer1, timer2;
const start_private_stream_for_others = () => {
  activate_chat_events();
  setTimeout(() => {
    elapsed_time_interval_others = setInterval(() => {
      elapsed_time_others++;
      let mins = Math.floor(elapsed_time_others / 60);
      let secs = elapsed_time_others % 60;
      document.getElementById(
        "elapsed-time"
      ).innerText = `Elapsed Time: ${mins}:${secs > 9 ? secs : `0${secs}`}`;
    }, 1000);
  }, 2000);
};

const activate_chat_events = async () => {
  const { connection, chatClientToken } = await open_channel(
    channel_id_private,
    "Private:",
    "us-east-1", // Replace with your chatroom region
    secretAccessKey, // Replace with your secret access key
    secretAccessId // Replace with your secret key id
  );
  privateConnection = connection;
  privateConnection.addEventListener("open", privateChatEventListener);
  attach_private_stream_for_others();
  privateViewerInterval = setInterval(() => {
    if (private_view_active && !waitingForFunding) {
      if (private_seconds_viewed % 30 == 0) {
        if (ivs_credits < private_stream_cost_per_second) {
          showPrettyModal(
            "Low Credits",
            "You don't have enough credits to continue watching this stream. Please buy more credits & View private stream again."
          );
          handle_private_stream_end_for_others();
          clearInterval(privateViewerInterval);
          return;
        }
        console.log("deducting credits");
        private_cost_deducted += private_stream_cost_view_total;
        ivs_credits -= private_stream_cost_view_total;
        updateCreditRelatedUI();
      }
      private_seconds_viewed++;
    }
  }, 1000);
};
const privateChatEventListener = () => {
  privateConnection.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log({ data });
    if (data.Type == "EVENT" && data.EventName == "delete-channel") {
      handle_private_stream_end_for_others();
      // setTimeout(() => {
      //   retyInsertStreamPlayback();
      // }, 2000);
    }
    if (data.Type == "EVENT" && data.EventName == "buy-credits") {
      waitingForFunding = false;
    }
    if (data.Type == "EVENT" && data.EventName == "more-credits-in-purchase") {
      waitingForFunding = true;
    }
    // if (data.Type == "EVENT" && data.EventName == "remaining-credits") {
    //   document.getElementById(
    //     "remaining-credits"
    //   ).innerText = `${data.Attributes.minutes}:${data.Attributes.seconds}`;
    // }
  };
};

const attach_private_stream_for_others = () => {
  if (document.getElementById("statusImage")) {
    document.getElementById("statusImage").remove();
  }
  document.getElementById("loader").style.display = "block";
  const PrivatePlayerEventType = IVSPlayer.PlayerEventType;
  const PrivatePlayerState = IVSPlayer.PlayerState;
  console.log("Private Player State", PrivatePlayerEventType);
  privatePlayer.addEventListener(
    PrivatePlayerEventType.ERROR,
    handle_private_stream_error_for_others
  );
  privatePlayer.addEventListener(
    PrivatePlayerState.PLAYING,
    handle_private_stream_playing_for_others
  );

  const videoElement = document.createElement("video");
  videoElement.setAttribute("id", "private-video-player");
  videoElement.style =
    "width: 100%;height:100%;position: absolute;top: 0;background: #000;border-radius: var(--radius);object-fit: cover;";
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
const handle_private_stream_error_for_others = err => {
  document.getElementById("loader").style.display = "block";
  console.log("Private Stream Load Fail , Retrying in 2 seconds");
  setTimeout(() => {
    privatePlayer.load(
      "https://562d3781dc12.us-east-1.playback.live-video.net/api/video/v1/us-east-1.701253760804.channel.YgqVVS5EahGW.m3u8"
    );
    privatePlayer.play();
  }, 2000);
};
const handle_private_stream_playing_for_others = () => {
  let vHeight = document
    .getElementById("private-video-player")
    .getBoundingClientRect();

  // document.getElementById("video-wrapper-top").style.height =
  //   vHeight.height + "px";
  privatePlayer.setMuted(true);
  document.getElementById(
    "viewButton-container"
  ).innerHTML = `<button id="endPrivateStream" onclick="handle_private_stream_end_for_others()">Stop Watching Private Stream</button>`;
  document
    .getElementById("private")
    .querySelector("span:first-child").textContent = "Go Public";
  console.log("Private Stream Playing");
  private_view_active = true;
  document.getElementById("loader").style.display = "none";
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
  //   document.getElementById("statusPrivateImage").remove();
};
const handle_private_stream_end_for_others = () => {
  //   refundRemainingTime();
  clearInterval(elapsed_time_interval_others);
  hideAllChatTabs();
  document.getElementById("loader").style.display = "none";
  insertImage(placeholderUrl + "private.png");

  document
    .getElementById("private")
    .querySelector("span:first-child").textContent = "Go Private";
  private_view_active = false;
  clearInterval(privateViewerInterval);
  // document.getElementById("modal").remove();
  privateConnection.close();
  if (document.getElementById("private-banner")) {
    document.getElementById("private-banner").remove();
  }
  document.getElementById("private-video-player").remove();

  privateConnection.removeEventListener("open", privateChatSocketListener);
  document.getElementById("requestButton").innerText = "Request Private Chat";
  document.getElementById("requestButton").onclick = requestPrivateStream;
  privatePlayer.removeEventListener(
    IVSPlayer.PlayerEventType.ERROR,
    handle_private_stream_error_for_others
  );
  privatePlayer.removeEventListener(
    IVSPlayer.PlayerState.PLAYING,
    handle_private_stream_playing_for_others
  );
  console.log("Private Player Unmounted");
  document.getElementById("viewButton-container").innerHTML = `
  <button
      id="viewButton"
      onclick="start_view_private_stream()"
    >
    View Private Stream
    </button>
  `;
  // privatePlayer.delete();
};
// const showToast = content => {
//   document.getElementById("toast-content").innerText = content;
//   button.click();
// };
// button.addEventListener("click", () => {
//   toast.classList.add("active");
//   progress.classList.add("active");

//   timer1 = setTimeout(() => {
//     toast.classList.remove("active");
//   }, 5000); //1s = 1000 milliseconds

//   timer2 = setTimeout(() => {
//     progress.classList.remove("active");
//   }, 5300);
// });

// clIcon.addEventListener("click", () => {
//   toast.classList.remove("active");

//   setTimeout(() => {
//     progress.classList.remove("active");
//   }, 300);

//   clearTimeout(timer1);
//   clearTimeout(timer2);
// });
