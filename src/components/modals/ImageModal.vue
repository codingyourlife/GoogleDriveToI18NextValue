<template>
  <modal-inner aria-label="Insert image">
    <div class="modal__content">
      <p>Please provide a <b>URL</b> for your image.</p>
      <form-entry label="URL" error="url">
        <input slot="field" class="textfield" type="text" v-model.trim="url" @keydown.enter="resolve">
      </form-entry>
      <!-- <menu-entry @click.native="openGooglePhotos(token)" v-for="token in googlePhotosTokens" :key="token.sub">
        <icon-provider slot="icon" provider-id="googlePhotos"></icon-provider>
        <div>Open from Google Photos</div>
        <span>{{token.name}}</span>
      </menu-entry>
      <menu-entry @click.native="addGooglePhotosAccount">
        <icon-provider slot="icon" provider-id="googlePhotos"></icon-provider>
        <span>Add Google Photos account</span>
      </menu-entry> -->
      <p>
        <small>Note: You can also paste public share links of Google Drive</small>
      </p>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from './common/modalTemplate';
import MenuEntry from '../menus/common/MenuEntry';
import googleHelper from '../../services/providers/helpers/googleHelper';
import store from '../../store';

function resolveGoogleDriveUrl(url) {
  if (!url) {
    console.error('URL is required');
    return url;
  }

  const googleDrivePattern = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view\?usp=sharing/;
  const match = url.match(googleDrivePattern);

  if (match) {
    const transformedUrl = `https://lh3.google.com/u/0/d/${match[1]}?export=view&authuser=0`;

    // Show a confirm dialog to the user
    const confirmMessage = "A new tab will open where you can copy the URL. Are you sure you want to proceed?";
    if (window.confirm(confirmMessage)) {
      // Open the transformed URL in a new tab if the user confirms
      window.open(transformedUrl, '_blank');
      return "";
    }
  } else {
    console.debug('Provided URL does not match the expected Google Drive URL pattern.');
  }

  return url;
}

export default modalTemplate({
  components: {
    MenuEntry,
  },
  data: () => ({
    url: '',
  }),
  computed: {
    googlePhotosTokens() {
      const googleTokensBySub = store.getters['data/googleTokensBySub'];
      return Object.values(googleTokensBySub)
        .filter(token => token.isPhotos)
        .sort((token1, token2) => token1.name.localeCompare(token2.name));
    },
  },
  methods: {
    resolve(evt) {
      evt.preventDefault(); // Fixes https://github.com/benweet/stackedit/issues/1503
      if (!this.url) {
        this.setError('url');
      } else {
        this.url = resolveGoogleDriveUrl(this.url);

        const { callback } = this.config;
        this.config.resolve();

        if(this.url) {
          callback(this.url);
        }
      }
    },
    reject() {
      const { callback } = this.config;
      this.config.reject();
      callback(null);
    },
    async addGooglePhotosAccount() {
      try {
        await googleHelper.addPhotosAccount();
      } catch (e) { /* cancel */ }
    },
    async openGooglePhotos(token) {
      const { callback } = this.config;
      this.config.reject();
      const res = await googleHelper.openPicker(token, 'img');
      if (res[0]) {
        store.dispatch('modal/open', {
          type: 'googlePhoto',
          url: res[0].url,
          callback,
        });
      }
    },
  },
});
</script>
