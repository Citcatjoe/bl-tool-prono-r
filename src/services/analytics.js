/**
 * Envoie un événement au dataLayer pour un clic sur "Tout voir".
 * @param {string} docId - L'ID du document Firestore.
 */
export function dataLayerPushSeeAllClick(docId) {
  // const iframeId = `storytelling_TEA_${docId}`;
  // if (window.blickDataLayer) {
  //   window.blickDataLayer.push({
  //     event: 'iframe_click',
  //     iframe_name: iframeId,
  //     iframe_id: 'iframe_see_all_clicked',
  //   });
  // } else {
  // }
}

/**
 * Envoie un événement au dataLayer pour un clic sur un lien global.
 * @param {string} docId - L'ID du document Firestore.
 */
// export function dataLayerPushLinkGlobalClick(docId) {
  // const iframeId = `storytelling_TEA_${docId}`;
  // if (window.blickDataLayer) {
    // window.blickDataLayer.push({
    //   event: 'iframe_click',
    //   iframe_name: iframeId,
    //   iframe_id: 'iframe_link_global_clicked',
    // });
    //console.log(`Event "link global click" pushed for docId: ${docId}`);
  // } else {
    //console.error('blickDataLayer is not defined');
  // }
// }

/**
 * Envoie un événement au dataLayer pour indiquer qu'une vue a été chargée.
 * @param {string} docId - L'ID du document Firestore.
 */
export function dataLayerPushView(docId) {
  const iframeId = `storytelling_PRONO_${docId}`;
  if (window.blickDataLayer) {
    window.blickDataLayer.push({
      event: 'iframe_impression',
      iframe_name: iframeId,
      iframe_id: 'iframe_impression',
    });
    //console.log(`Event "view" pushed for ${iframeId}`);
  } else {
    //console.error('blickDataLayer is not defined');
  }
}