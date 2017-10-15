// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */

function getSavedData(callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(["celebrity", "gif"], (items) => {
    callback(chrome.runtime.lastError ? null : items);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveData(celeb, gif) {
  var items = {};
  items["celebrity"] = celeb;
  items["gif"] = gif;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  console.log("here!");
  var submit = document.getElementById("submit");
  var celeb = document.getElementsByName("celebrity")[0];
  var gif = document.getElementsByName("gif")[0];
  console.log("submit button", submit);
  // Load the saved background color for this page and modify the dropdown
  // value, if needed.

  getSavedData((items) => {
    if (items["celebrity"] && items["gif"]) {
      celebrityVal = items["celebrity"];
      gifVal = items["gif"];
      celeb.value = celebrityVal;
      gif.value = gifVal;
    }
  });

  // Ensure the background color is changed and saved when the dropdown
  // selection changes.
  submit.addEventListener('click', () => {
    celeb = document.getElementsByName("celebrity")[0].value;
    gif = document.getElementsByName("gif")[0].value;
    console.log(celeb, gif);
    saveData(celeb, gif);
  });
});
