function getFollowList() {
  fetch('https://live.kuaishou.com/live_api/follow/living', {
    headers: {
      Cookie:
        'clientid=3; did=web_1f287fe41128cede5d41b7c9ae8199b7; client_key=65890b29; kpn=GAME_ZONE; _did=web_294715569871E1FE; soft_did=1619580708547; did=web_cd3f63c89df36ee5eb0ccf740cbd9e30; kuaishou.live.bfb1s=477cb0011daca84b36b3a4676857e5a1; userId=2970000063; userId=2970000063; showFollowRedIcon=1; kuaishou.live.web_st=ChRrdWFpc2hvdS5saXZlLndlYi5zdBKgATt2fqqdlP-2dSyDIaxNbXrduqEByq0tTjMfs8IK3pz6-butD66UFrTcwh-sNRN9E8LlIGttvb9hkmW77uRjOV7pDPIIbgWt1LUL-BlSBW9QpDTDYH9hrSbDd_jyUjvLHOigZrnK2DxIyFP4PaT55Lgv5rrV6LeS0Wqw72by62E_aSQzmpadGMegvpMOFigv1jdNEiWQxNJ1dXnvWwNNvb8aEsvpGUru20c-iIt7T0W8MQrXwiIgYdeMQgcfJPDgGBYg-8GYcuQyHOS6pe2lO3imwm3n-fAoBTAB; kuaishou.live.web_ph=c9a6456428fd59b14048d0dffed8f4c24a0f'
    }
  })
    .then((res) => res.json())
    .then((data) => {
      console.dir(data.data.list, { depth: null })
      setTimeout(() => {
        getFollowList()
      }, 5 * 1000)
    })
    .catch((err) => {
      console.log(err)
    })
}

// getFollowList()
fetch('https://live.kuaishou.com/live_api/follow/living', {
  headers: {
    Cookie:
      'clientid=3; did=web_1f287fe41128cede5d41b7c9ae8199b7; client_key=65890b29; kpn=GAME_ZONE; _did=web_294715569871E1FE; soft_did=1619580708547; did=web_cd3f63c89df36ee5eb0ccf740cbd9e30; kuaishou.live.bfb1s=477cb0011daca84b36b3a4676857e5a1; userId=2970000063; userId=2970000063; showFollowRedIcon=1; kuaishou.live.web_st=ChRrdWFpc2hvdS5saXZlLndlYi5zdBKgATt2fqqdlP-2dSyDIaxNbXrduqEByq0tTjMfs8IK3pz6-butD66UFrTcwh-sNRN9E8LlIGttvb9hkmW77uRjOV7pDPIIbgWt1LUL-BlSBW9QpDTDYH9hrSbDd_jyUjvLHOigZrnK2DxIyFP4PaT55Lgv5rrV6LeS0Wqw72by62E_aSQzmpadGMegvpMOFigv1jdNEiWQxNJ1dXnvWwNNvb8aEsvpGUru20c-iIt7T0W8MQrXwiIgYdeMQgcfJPDgGBYg-8GYcuQyHOS6pe2lO3imwm3n-fAoBTAB; kuaishou.live.web_ph=c9a6456428fd59b14048d0dffed8f4c24a0f'
  }
})
  .then((res) => res.json())
  .then((data) => {
    console.dir(data.data.list.length)
    setTimeout(() => {
      getFollowList()
    }, 2 * 1000)
  })
  .catch((err) => {
    console.log(err)
  })
