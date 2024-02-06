define("views/email/record/detail", ["exports", "views/record/detail"], function (_exports, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/email/record/detail */

  class EmailDetailRecordView extends _detail.default {
    sideView = 'views/email/record/detail-side';
    duplicateAction = false;
    shortcutKeyCtrlEnterAction = 'send';
    layoutNameConfigure() {
      if (this.model.isNew()) {
        return;
      }
      const status = this.model.get('status');
      if (status === 'Draft') {
        this.layoutName = 'composeSmall';
        return;
      }
      let isRestricted = false;
      if (status === 'Sent') {
        isRestricted = true;
      }
      if (status === 'Archived') {
        if (this.model.get('createdById') === this.getHelper().getAppParam('systemUserId') || !this.model.get('createdById') || this.model.get('isImported')) {
          isRestricted = true;
        }
      }
      if (isRestricted) {
        this.layoutName += 'Restricted';
      }
      this.isRestricted = isRestricted;
    }
    init() {
      super.init();
      this.layoutNameConfigure();
    }
    setup() {
      super.setup();
      if (['Archived', 'Sent'].includes(this.model.get('status'))) {
        this.shortcutKeyCtrlEnterAction = 'save';
      }
      this.addButtonEdit({
        name: 'send',
        action: 'send',
        label: 'Send',
        style: 'primary',
        title: 'Ctrl+Enter'
      }, true);
      this.addButtonEdit({
        name: 'saveDraft',
        action: 'save',
        label: 'Save Draft',
        title: 'Ctrl+S'
      }, true);
      this.addButton({
        name: 'sendFromDetail',
        label: 'Send',
        hidden: true
      });
      this.controlSendButton();
      this.listenTo(this.model, 'change:status', () => this.controlSendButton());
      if (this.model.get('status') !== 'Draft' && this.model.has('isRead') && !this.model.get('isRead')) {
        this.model.set('isRead', true);
      }
      this.listenTo(this.model, 'sync', () => {
        if (!this.model.get('isRead') && this.model.get('status') !== 'Draft') {
          this.model.set('isRead', true);
        }
      });
      if (!(this.model.get('isHtml') && this.model.get('bodyPlain'))) {
        this.listenToOnce(this.model, 'sync', () => {
          if (this.model.get('isHtml') && this.model.get('bodyPlain')) {
            this.showActionItem('showBodyPlain');
          }
        });
      }
      if (this.model.get('isUsers')) {
        this.addDropdownItem({
          'label': 'Mark as Important',
          'name': 'markAsImportant',
          'hidden': this.model.get('isImportant')
        });
        this.addDropdownItem({
          'label': 'Unmark Importance',
          'name': 'markAsNotImportant',
          'hidden': !this.model.get('isImportant')
        });
        this.addDropdownItem({
          'label': 'Move to Trash',
          'name': 'moveToTrash',
          'hidden': this.model.get('inTrash')
        });
        this.addDropdownItem({
          'label': 'Retrieve from Trash',
          'name': 'retrieveFromTrash',
          'hidden': !this.model.get('inTrash')
        });
        this.addDropdownItem({
          'label': 'Move to Folder',
          'name': 'moveToFolder'
        });
      }
      this.addDropdownItem({
        label: 'Show Plain Text',
        name: 'showBodyPlain',
        hidden: !(this.model.get('isHtml') && this.model.get('bodyPlain'))
      });
      this.addDropdownItem({
        label: 'Print',
        name: 'print'
      });
      this.listenTo(this.model, 'change:isImportant', () => {
        if (this.model.get('isImportant')) {
          this.hideActionItem('markAsImportant');
          this.showActionItem('markAsNotImportant');
        } else {
          this.hideActionItem('markAsNotImportant');
          this.showActionItem('markAsImportant');
        }
      });
      this.listenTo(this.model, 'change:inTrash', () => {
        if (this.model.get('inTrash')) {
          this.hideActionItem('moveToTrash');
          this.showActionItem('retrieveFromTrash');
        } else {
          this.hideActionItem('retrieveFromTrash');
          this.showActionItem('moveToTrash');
        }
      });
      this.handleTasksField();
      this.listenTo(this.model, 'change:tasksIds', () => this.handleTasksField());
      if (this.getUser().isAdmin()) {
        this.addDropdownItem({
          label: 'View Users',
          name: 'viewUsers'
        });
      }
      this.setFieldReadOnly('replied');
      if (this.model.get('status') === 'Draft') {
        this.setFieldReadOnly('dateSent');
        this.controlSelectTemplateField();
        this.on('after:mode-change', () => this.controlSelectTemplateField());
      }
      if (this.isRestricted) {
        this.handleAttachmentField();
        this.listenTo(this.model, 'change:attachmentsIds', () => this.handleAttachmentField());
        this.handleCcField();
        this.listenTo(this.model, 'change:cc', () => this.handleCcField());
        this.handleBccField();
        this.listenTo(this.model, 'change:bcc', () => this.handleBccField());
      }
    }
    controlSelectTemplateField() {
      if (this.mode === this.MODE_EDIT) {
        // Not implemented for detail view yet.
        this.hideField('selectTemplate');
        return;
      }
      this.hideField('selectTemplate');
    }
    controlSendButton() {
      const status = this.model.get('status');
      if (status === 'Draft') {
        this.showActionItem('send');
        this.showActionItem('saveDraft');
        this.showActionItem('sendFromDetail');
        this.hideActionItem('save');
        this.hideActionItem('saveAndContinueEditing');
        return;
      }
      this.hideActionItem('sendFromDetail');
      this.hideActionItem('send');
      this.hideActionItem('saveDraft');
      this.showActionItem('save');
      this.showActionItem('saveAndContinueEditing');
    }

    // noinspection JSUnusedGlobalSymbols
    actionSaveDraft() {
      this.actionSaveAndContinueEditing();
    }
    actionMarkAsImportant() {
      Espo.Ajax.postRequest('Email/inbox/important', {
        id: this.model.id
      });
      this.model.set('isImportant', true);
    }
    actionMarkAsNotImportant() {
      Espo.Ajax.deleteRequest('Email/inbox/important', {
        id: this.model.id
      });
      this.model.set('isImportant', false);
    }
    actionMoveToTrash() {
      Espo.Ajax.postRequest('Email/inbox/inTrash', {
        id: this.model.id
      }).then(() => {
        Espo.Ui.warning(this.translate('Moved to Trash', 'labels', 'Email'));
      });
      this.model.set('inTrash', true);
      if (this.model.collection) {
        this.model.collection.trigger('moving-to-trash', this.model.id);
      }
    }

    // noinspection JSUnusedGlobalSymbols
    actionRetrieveFromTrash() {
      Espo.Ajax.deleteRequest('Email/inbox/inTrash', {
        id: this.model.id
      }).then(() => {
        Espo.Ui.warning(this.translate('Retrieved from Trash', 'labels', 'Email'));
      });
      this.model.set('inTrash', false);
      if (this.model.collection) {
        this.model.collection.trigger('retrieving-from-trash', this.model.id);
      }
    }
    actionMoveToFolder() {
      this.createView('dialog', 'views/email-folder/modals/select-folder', {}, view => {
        view.render();
        this.listenToOnce(view, 'select', folderId => {
          this.clearView('dialog');
          Espo.Ajax.postRequest(`Email/inbox/folders/${folderId}`, {
            id: this.model.id
          }).then(() => {
            if (folderId === 'inbox') {
              folderId = null;
            }
            this.model.set('folderId', folderId);
            Espo.Ui.success(this.translate('Done'));
          });
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionShowBodyPlain() {
      this.createView('bodyPlain', 'views/email/modals/body-plain', {
        model: this.model
      }, view => {
        view.render();
      });
    }
    handleAttachmentField() {
      if ((this.model.get('attachmentsIds') || []).length === 0) {
        this.hideField('attachments');
      } else {
        this.showField('attachments');
      }
    }
    handleCcField() {
      if (!this.model.get('cc')) {
        this.hideField('cc');
      } else {
        this.showField('cc');
      }
    }
    handleBccField() {
      if (!this.model.get('bcc')) {
        this.hideField('bcc');
      } else {
        this.showField('bcc');
      }
    }
    send() {
      const model = this.model;
      const status = model.get('status');
      model.set('status', 'Sending');
      this.isSending = true;
      const afterSend = () => {
        model.trigger('after:send');
        this.trigger('after:send');
        this.isSending = false;
      };
      this.once('after:save', afterSend, this);
      this.once('cancel:save', () => {
        this.off('after:save', afterSend);
        this.isSending = false;
        model.set('status', status);
      });
      this.once('before:save', () => {
        Espo.Ui.notify(this.translate('Sending...', 'labels', 'Email'));
      });
      return this.save();
    }

    // noinspection JSUnusedGlobalSymbols
    actionSendFromDetail() {
      this.setEditMode().then(() => {
        return this.send();
      }).then(() => {
        this.setDetailMode();
      });
    }

    // noinspection JSUnusedGlobalSymbols
    exitAfterDelete() {
      let folderId = ((this.collection || {}).data || {}).folderId || null;
      if (folderId === 'inbox') {
        folderId = null;
      }
      const options = {
        isReturn: true,
        isReturnThroughLink: false,
        folder: folderId
      };
      let url = '#' + this.scope;
      let action = null;
      if (folderId) {
        action = 'list';
        url += '/list/folder=' + folderId;
      }
      this.getRouter().dispatch(this.scope, action, options);
      this.getRouter().navigate(url, {
        trigger: false
      });
      return true;
    }

    // noinspection JSUnusedGlobalSymbols
    actionViewUsers(data) {
      const viewName = this.getMetadata().get(['clientDefs', this.model.entityType, 'relationshipPanels', 'users', 'viewModalView']) || this.getMetadata().get(['clientDefs', 'User', 'modalViews', 'relatedList']) || 'views/modals/related-list';
      const options = {
        model: this.model,
        link: 'users',
        scope: 'User',
        filtersDisabled: true,
        url: this.model.entityType + '/' + this.model.id + '/users',
        createDisabled: true,
        selectDisabled: !this.getUser().isAdmin(),
        rowActionsView: 'views/record/row-actions/relationship-view-and-unlink'
      };
      if (data.viewOptions) {
        for (const item in data.viewOptions) {
          options[item] = data.viewOptions[item];
        }
      }
      Espo.Ui.notify(' ... ');
      this.createView('modalRelatedList', viewName, options, view => {
        Espo.Ui.notify(false);
        view.render();
        this.listenTo(view, 'action', (event, element) => {
          Espo.Utils.handleAction(this, event, element);
        });
        this.listenToOnce(view, 'close', () => {
          this.clearView('modalRelatedList');
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionSend() {
      this.send().then(() => {
        this.model.set('status', 'Sent');
        if (this.mode !== this.MODE_DETAIL) {
          this.setDetailMode();
          this.setFieldReadOnly('dateSent');
          this.setFieldReadOnly('name');
          this.setFieldReadOnly('attachments');
          this.setFieldReadOnly('isHtml');
          this.setFieldReadOnly('from');
          this.setFieldReadOnly('to');
          this.setFieldReadOnly('cc');
          this.setFieldReadOnly('bcc');
        }
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPrint() {
      /** @type {module:views/fields/wysiwyg} */
      const bodyView = this.getFieldView('body');
      if (!bodyView) {
        return;
      }
      let iframe = /** @type HTMLIFrameElement */bodyView.$el.find('iframe').get(0);
      if (iframe) {
        iframe.contentWindow.print();
        return;
      }
      const el = bodyView.$el.get(0);
      /** @type {Element} */
      const recordElement = this.$el.get(0);
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      recordElement.append(iframe);
      const contentWindow = iframe.contentWindow;
      contentWindow.document.open();
      contentWindow.document.write(el.innerHTML);
      contentWindow.document.close();
      contentWindow.focus();
      contentWindow.print();
      contentWindow.onafterprint = () => {
        recordElement.removeChild(iframe);
      };
    }
    errorHandlerSendingFail(data) {
      if (!this.model.id) {
        this.model.id = data.id;
      }
      let msg = this.translate('sendingFailed', 'strings', 'Email');
      if (data.message) {
        let part = data.message;
        if (this.getLanguage().has(part, 'messages', 'Email')) {
          part = this.translate(part, 'messages', 'Email');
        }
        msg += ': ' + part;
      }
      Espo.Ui.error(msg, true);
      console.error(msg);
    }
    handleTasksField() {
      if ((this.model.get('tasksIds') || []).length === 0) {
        this.hideField('tasks');
        return;
      }
      this.showField('tasks');
    }

    /**
     * @protected
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyCtrlS(e) {
      if (this.inlineEditModeIsOn || this.buttonsDisabled) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (this.mode !== this.MODE_EDIT) {
        return;
      }
      if (!this.saveAndContinueEditingAction) {
        return;
      }
      if (!this.hasAvailableActionItem('saveDraft') && !this.hasAvailableActionItem('saveAndContinueEditing')) {
        return;
      }
      this.actionSaveAndContinueEditing();
    }
  }
  var _default = EmailDetailRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/email-address', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        getAutocompleteMaxCount: function () {
            if (this.autocompleteMaxCount) {
                return this.autocompleteMaxCount;
            }

            return this.getConfig().get('recordsPerPage');
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.$input = this.$el.find('input');

            if (this.mode === this.MODE_SEARCH && this.getAcl().check('Email', 'create')) {
                this.initSearchAutocomplete();
            }

            if (this.mode === this.MODE_SEARCH) {
                this.$input.on('input', () => {
                    this.trigger('change');
                });
            }
        },

        initSearchAutocomplete: function () {
            this.$input = this.$input || this.$el.find('input');

            this.$input.autocomplete({
                serviceUrl: () => {
                    return `EmailAddress/search` +
                        `?maxSize=${this.getAutocompleteMaxCount()}`
                },
                paramName: 'q',
                minChars: 1,
                autoSelectFirst: true,
                triggerSelectOnValidInput: false,
                noCache: true,
                formatResult: suggestion => {
                    return this.getHelper().escapeString(suggestion.name) + ' &#60;' +
                        this.getHelper().escapeString(suggestion.id) + '&#62;';
                },
                transformResult: response => {
                    response = JSON.parse(response);

                    let list = response.map(item => {
                        return {
                            id: item.emailAddress,
                            name: item.entityName,
                            emailAddress: item.emailAddress,
                            entityId: item.entityId,
                            entityName: item.entityName,
                            entityType: item.entityType,
                            data: item.emailAddress,
                            value: item.emailAddress,
                        }
                    });

                    if (this.skipCurrentInAutocomplete) {
                        let current = this.$input.val();

                        list = list.filter(item => item.emailAddress !== current)
                    }

                    return {suggestions: list};
                },
                onSelect: (s) => {
                    this.$input.val(s.emailAddress);
                    this.$input.focus();
                },
            });

            this.once('render', () => {
                this.$input.autocomplete('dispose');
            });

            this.once('remove', () => {
                this.$input.autocomplete('dispose');
            });
        },

        fetchSearch: function () {
            let value = this.$element.val();

            if (typeof value.trim === 'function') {
                value = value.trim();
            }

            if (value) {
                return {
                    type: 'equals',
                    value: value,
                };
            }

            return null;
        },
    });
});

define("views/user/record/detail", ["exports", "views/record/detail"], function (_exports, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class UserDetailRecordView extends _detail.default {
    sideView = 'views/user/record/detail-side';
    bottomView = 'views/user/record/detail-bottom';
    editModeDisabled = true;

    /**
     * @name model
     * @type module:models/user
     * @memberOf UserDetailRecordView#
     */

    setup() {
      super.setup();
      this.setupNonAdminFieldsAccess();
      if (this.getUser().isAdmin() && !this.model.isPortal()) {
        this.addButton({
          name: 'access',
          label: 'Access',
          style: 'default',
          onClick: () => this.actionAccess()
        });
      }
      const isPortalUser = this.model.isPortal() || this.model.id === this.getUser().id && this.getUser().isPortal();
      if ((this.model.id === this.getUser().id || this.getUser().isAdmin()) && this.getConfig().get('auth2FA') && (this.model.isRegular() || this.model.isAdmin() || isPortalUser && this.getConfig().get('auth2FAInPortal'))) {
        this.addButton({
          name: 'viewSecurity',
          label: 'Security'
        });
      }
      if (this.model.id === this.getUser().id && !this.model.isApi() && (this.getUser().isAdmin() || !this.getHelper().getAppParam('passwordChangeForNonAdminDisabled'))) {
        this.addDropdownItem({
          name: 'changePassword',
          label: 'Change Password',
          style: 'default'
        });
      }
      if (this.getUser().isAdmin() && (this.model.isRegular() || this.model.isAdmin() || this.model.isPortal()) && !this.model.isSuperAdmin()) {
        this.addDropdownItem({
          name: 'sendPasswordChangeLink',
          label: 'Send Password Change Link',
          action: 'sendPasswordChangeLink',
          hidden: !this.model.get('emailAddress')
        });
        this.addDropdownItem({
          name: 'generateNewPassword',
          label: 'Generate New Password',
          action: 'generateNewPassword',
          hidden: !this.model.get('emailAddress')
        });
        if (!this.model.get('emailAddress')) {
          this.listenTo(this.model, 'sync', () => {
            if (this.model.get('emailAddress')) {
              this.showActionItem('generateNewPassword');
              this.showActionItem('sendPasswordChangeLink');
            } else {
              this.hideActionItem('generateNewPassword');
              this.hideActionItem('sendPasswordChangeLink');
            }
          });
        }
      }
      if (this.model.isPortal() || this.model.isApi()) {
        this.hideActionItem('duplicate');
      }
      if (this.model.id === this.getUser().id) {
        this.listenTo(this.model, 'after:save', () => {
          this.getUser().set(this.model.getClonedAttributes());
        });
      }
      if (this.getUser().isAdmin() && this.model.isRegular() && !this.getConfig().get('authAnotherUserDisabled')) {
        this.addDropdownItem({
          label: 'Log in',
          name: 'login',
          action: 'login'
        });
      }
      this.setupFieldAppearance();
    }
    setupActionItems() {
      super.setupActionItems();
      if (this.model.isApi() && this.getUser().isAdmin()) {
        this.addDropdownItem({
          'label': 'Generate New API Key',
          'name': 'generateNewApiKey'
        });
      }
    }
    setupNonAdminFieldsAccess() {
      if (this.getUser().isAdmin()) {
        return;
      }
      let nonAdminReadOnlyFieldList = ['userName', 'isActive', 'teams', 'roles', 'password', 'portals', 'portalRoles', 'contact', 'accounts', 'type', 'emailAddress'];
      nonAdminReadOnlyFieldList = nonAdminReadOnlyFieldList.filter(item => {
        if (!this.model.hasField(item)) {
          return true;
        }
        const aclDefs = /** @type {Object.<string, *>|null} */
        this.getMetadata().get(['entityAcl', 'User', 'fields', item]);
        if (!aclDefs) {
          return true;
        }
        if (aclDefs.nonAdminReadOnly) {
          return true;
        }
        return false;
      });
      nonAdminReadOnlyFieldList.forEach(field => {
        this.setFieldReadOnly(field, true);
      });
      if (!this.getAcl().checkScope('Team')) {
        this.setFieldReadOnly('defaultTeam', true);
      }
      this.hideField('layoutSet', true);
    }
    setupFieldAppearance() {
      this.controlFieldAppearance();
      this.listenTo(this.model, 'change', () => {
        this.controlFieldAppearance();
      });
    }
    controlFieldAppearance() {
      if (this.model.get('type') === 'portal') {
        this.hideField('roles');
        this.hideField('teams');
        this.hideField('defaultTeam');
        this.showField('portals');
        this.showField('portalRoles');
        this.showField('contact');
        this.showField('accounts');
        this.showPanel('portal');
        this.hideField('title');
      } else {
        this.showField('roles');
        this.showField('teams');
        this.showField('defaultTeam');
        this.hideField('portals');
        this.hideField('portalRoles');
        this.hideField('contact');
        this.hideField('accounts');
        this.hidePanel('portal');
        if (this.model.get('type') === 'api') {
          this.hideField('title');
          this.hideField('emailAddress');
          this.hideField('phoneNumber');
          this.hideField('name');
          this.hideField('gender');
          if (this.model.get('authMethod') === 'Hmac') {
            this.showField('secretKey');
          } else {
            this.hideField('secretKey');
          }
        } else {
          this.showField('title');
        }
      }
      if (this.model.id === this.getUser().id) {
        this.setFieldReadOnly('type');
      } else {
        if (this.model.get('type') === 'admin' || this.model.get('type') === 'regular') {
          this.setFieldNotReadOnly('type');
          this.setFieldOptionList('type', ['regular', 'admin']);
        } else {
          this.setFieldReadOnly('type');
        }
      }
      if (!this.getConfig().get('auth2FA') || !(this.model.isRegular() || this.model.isAdmin())) {
        this.hideField('auth2FA');
      }
    }

    // noinspection JSUnusedGlobalSymbols
    actionChangePassword() {
      Espo.Ui.notify(' ... ');
      this.createView('changePassword', 'views/modals/change-password', {
        userId: this.model.id
      }, view => {
        view.render();
        Espo.Ui.notify(false);
        this.listenToOnce(view, 'changed', () => {
          setTimeout(() => {
            this.getBaseController().logout();
          }, 2000);
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionPreferences() {
      this.getRouter().navigate('#Preferences/edit/' + this.model.id, {
        trigger: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionEmailAccounts() {
      this.getRouter().navigate('#EmailAccount/list/userId=' + this.model.id, {
        trigger: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionExternalAccounts() {
      this.getRouter().navigate('#ExternalAccount', {
        trigger: true
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionAccess() {
      Espo.Ui.notify(' ... ');
      Espo.Ajax.getRequest(`User/${this.model.id}/acl`).then(aclData => {
        this.createView('access', 'views/user/modals/access', {
          aclData: aclData,
          model: this.model
        }, view => {
          Espo.Ui.notify(false);
          view.render();
        });
      });
    }
    getGridLayout(callback) {
      this.getHelper().layoutManager.get(this.model.entityType, this.options.layoutName || this.layoutName, simpleLayout => {
        const layout = Espo.Utils.cloneDeep(simpleLayout);
        if (!this.getUser().isPortal()) {
          layout.push({
            "label": "Teams and Access Control",
            "name": "accessControl",
            "rows": [[{
              "name": "type"
            }, {
              "name": "isActive"
            }], [{
              "name": "teams"
            }, {
              "name": "defaultTeam"
            }], [{
              "name": "roles"
            }, false]]
          });
          if (this.model.isPortal()) {
            layout.push({
              "label": "Portal",
              "name": "portal",
              "rows": [[{
                "name": "portals"
              }, {
                "name": "contact"
              }], [{
                "name": "portalRoles"
              }, {
                "name": "accounts"
              }]]
            });
            if (this.getUser().isAdmin()) {
              layout.push({
                "label": "Misc",
                "name": "portalMisc",
                "rows": [[{
                  "name": "dashboardTemplate"
                }, false]]
              });
            }
          }
          if (this.model.isAdmin() || this.model.isRegular()) {
            layout.push({
              "label": "Misc",
              "name": "misc",
              "rows": [[{
                "name": "workingTimeCalendar"
              }, {
                "name": "layoutSet"
              }]]
            });
          }
        }
        if (this.getUser().isAdmin() && this.model.isApi()) {
          layout.push({
            "name": "auth",
            "rows": [[{
              "name": "authMethod"
            }, false], [{
              "name": "apiKey"
            }, {
              "name": "secretKey"
            }]]
          });
        }
        const gridLayout = {
          type: 'record',
          layout: this.convertDetailLayout(layout)
        };
        callback(gridLayout);
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionGenerateNewApiKey() {
      this.confirm(this.translate('confirmation', 'messages'), () => {
        Espo.Ajax.postRequest('UserSecurity/apiKey/generate', {
          id: this.model.id
        }).then(data => {
          this.model.set(data);
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionViewSecurity() {
      this.createView('dialog', 'views/user/modals/security', {
        userModel: this.model
      }, view => {
        view.render();
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionSendPasswordChangeLink() {
      this.confirm({
        message: this.translate('sendPasswordChangeLinkConfirmation', 'messages', 'User'),
        confirmText: this.translate('Send', 'labels', 'Email')
      }).then(() => {
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        Espo.Ajax.postRequest('UserSecurity/password/recovery', {
          id: this.model.id
        }).then(() => {
          Espo.Ui.success(this.translate('Done'));
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionGenerateNewPassword() {
      this.confirm(this.translate('generateAndSendNewPassword', 'messages', 'User')).then(() => {
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        Espo.Ajax.postRequest('UserSecurity/password/generate', {
          id: this.model.id
        }).then(() => {
          Espo.Ui.success(this.translate('Done'));
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionLogin() {
      const anotherUser = this.model.get('userName');
      const username = this.getUser().get('userName');
      this.createView('dialog', 'views/user/modals/login-as', {
        model: this.model,
        anotherUser: anotherUser,
        username: username
      }).then(view => view.render());
    }
  }
  var _default = UserDetailRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/detail-side', ['views/record/detail-side'], function (Dep) {

    return Dep.extend({

        setupPanels: function () {
            Dep.prototype.setupPanels.call(this);

            if (this.model.isApi() || this.model.isSystem()) {
                this.hidePanel('activities', true);
                this.hidePanel('history', true);
                this.hidePanel('tasks', true);
                this.hidePanel('stream', true);

                return;
            }

            var showActivities = this.getAcl().checkUserPermission(this.model);

            if (!showActivities) {
                if (this.getAcl().get('userPermission') === 'team') {
                    if (!this.model.has('teamsIds')) {
                        this.listenToOnce(this.model, 'sync', function () {
                            if (this.getAcl().checkUserPermission(this.model)) {
                                this.onPanelsReady(function () {
                                    this.showPanel('activities', 'acl');
                                    this.showPanel('history', 'acl');
                                    if (!this.model.isPortal()) {
                                        this.showPanel('tasks', 'acl');
                                    }
                                });
                            }
                        }, this);
                    }
                }
            }

            if (!showActivities) {
                this.hidePanel('activities', false, 'acl');
                this.hidePanel('history', false, 'acl');
                this.hidePanel('tasks', false, 'acl');
            }

            if (this.model.isPortal()) {
                this.hidePanel('tasks', true);
            }
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/theme', ['views/fields/enum', 'theme-manager', 'ui/select'],
function (Dep, ThemeManager, /** module:ui/select*/Select) {

    return Dep.extend({

        editTemplateContent: `
            <div class="grid-auto-fit-xxs">
                <div>
                    <select data-name="{{name}}" class="form-control main-element">
                        {{options
                            params.options value
                            scope=scope
                            field=name
                            translatedOptions=translatedOptions
                            includeMissingOption=true
                            styleMap=params.style
                        }}
                    </select>
                </div>
                {{#if navbarOptionList.length}}
                <div>
                    <select data-name="themeNavbar" class="form-control">
                        {{options navbarOptionList navbar translatedOptions=navbarTranslatedOptions}}
                    </select>
                </div>
                {{/if}}
            </div>
        `,

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.navbarOptionList = this.getNavbarOptionList();
            data.navbar = this.getNavbarValue() || this.getDefaultNavbar();

            data.navbarTranslatedOptions = {};
            data.navbarOptionList.forEach(item => {
                data.navbarTranslatedOptions[item] = this.translate(item, 'themeNavbars');
            });

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.initThemeManager();

            this.model.on('change:theme', (m, v, o) => {
                this.initThemeManager()

                if (o.ui) {
                    this.reRender()
                        .then(() => Select.focus(this.$element, {noTrigger: true}));
                }
            })
        },

        afterRenderEdit: function () {
            this.$navbar = this.$el.find('[data-name="themeNavbar"]');

            this.$navbar.on('change', () => this.trigger('change'));

            Select.init(this.$navbar);
        },

        getNavbarValue: function () {
            let params = this.model.get('themeParams') || {};

            return params.navbar;
        },

        getNavbarDefs: function () {
            if (!this.themeManager) {
                return null;
            }

            let params = this.themeManager.getParam('params');

            if (!params || !params.navbar) {
                return null;
            }

            return Espo.Utils.cloneDeep(params.navbar);
        },

        getNavbarOptionList: function () {
            let defs = this.getNavbarDefs();

            if (!defs) {
                return [];
            }

            let optionList = defs.options || [];

            if (!optionList.length || optionList.length === 1) {
                return [];
            }

            return optionList;
        },

        getDefaultNavbar: function () {
            let defs = this.getNavbarDefs() || {};

            return defs.default || null;
        },

        initThemeManager: function () {
            let theme = this.model.get('theme');

            if (!theme) {
                this.themeManager = null;

                return;
            }

            this.themeManager = new ThemeManager(
                this.getConfig(),
                this.getPreferences(),
                this.getMetadata(),
                theme
            );
        },

        getAttributeList: function () {
            return [this.name, 'themeParams'];
        },

        setupOptions: function () {
            this.params.options = Object.keys(this.getMetadata().get('themes') || {})
                .sort((v1, v2) => {
                    if (v2 === 'EspoRtl') {
                        return -1;
                    }

                    return this.translate(v1, 'theme')
                        .localeCompare(this.translate(v2, 'theme'));
                });
        },

        fetch: function () {
            let data = Dep.prototype.fetch.call(this);

            let params = {};

            if (this.$navbar.length) {
                params.navbar = this.$navbar.val();
            }

            data.themeParams = params;

            return data;
        },
    });
});

define("views/settings/fields/tab-list", ["exports", "views/fields/array"], function (_exports, _array) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _array = _interopRequireDefault(_array);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class TabListFieldView extends _array.default {
    addItemModalView = 'views/settings/modals/tab-list-field-add';
    noGroups = false;
    noDelimiters = false;
    setup() {
      super.setup();
      this.selected.forEach(item => {
        if (item && typeof item === 'object') {
          if (!item.id) {
            item.id = this.generateItemId();
          }
        }
      });
      this.events['click [data-action="editGroup"]'] = e => {
        let id = $(e.currentTarget).parent().data('value').toString();
        this.editGroup(id);
      };
    }
    generateItemId() {
      return Math.floor(Math.random() * 1000000 + 1).toString();
    }
    setupOptions() {
      this.params.options = Object.keys(this.getMetadata().get('scopes')).filter(scope => {
        if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
          return false;
        }
        if (!this.getAcl().checkScope(scope)) {
          return false;
        }
        return this.getMetadata().get('scopes.' + scope + '.tab');
      }).sort((v1, v2) => {
        return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
      });
      if (!this.noDelimiters) {
        this.params.options.push('_delimiter_');
        this.params.options.push('_delimiter-ext_');
      }
      this.translatedOptions = {};
      this.params.options.forEach(item => {
        this.translatedOptions[item] = this.translate(item, 'scopeNamesPlural');
      });
      this.translatedOptions['_delimiter_'] = '. . .';
      this.translatedOptions['_delimiter-ext_'] = '. . .';
    }
    addValue(value) {
      if (value && typeof value === 'object') {
        if (!value.id) {
          value.id = this.generateItemId();
        }
        let html = this.getItemHtml(value);
        this.$list.append(html);
        this.selected.push(value);
        this.trigger('change');
        return;
      }
      super.addValue(value);
    }
    removeValue(value) {
      let index = this.getGroupIndexById(value);
      if (~index) {
        this.$list.children('[data-value="' + value + '"]').remove();
        this.selected.splice(index, 1);
        this.trigger('change');
        return;
      }
      super.removeValue(value);
    }
    getItemHtml(value) {
      if (value && typeof value === 'object') {
        return this.getGroupItemHtml(value);
      }
      return super.getItemHtml(value);
    }
    getGroupItemHtml(item) {
      let label = item.text || '';
      let $label = $('<span>').text(label);
      let $icon = null;
      if (item.type === 'group') {
        $icon = $('<span>').addClass('far fa-list-alt').addClass('text-muted');
      }
      if (item.type === 'divider') {
        $label.addClass('text-soft').addClass('text-italic');
      }
      let $item = $('<span>').append($label);
      if ($icon) {
        $item.prepend($icon, ' ');
      }
      return $('<div>').addClass('list-group-item').attr('data-value', item.id).css('cursor', 'default').append($('<a>').attr('role', 'button').attr('tabindex', '0').attr('data-value', item.id).attr('data-action', 'editGroup').css('margin-right', '7px').append($('<span>').addClass('fas fa-pencil-alt fa-sm')), $item, '&nbsp;', $('<a>').addClass('pull-right').attr('role', 'button').attr('tabindex', '0').attr('data-value', item.id).attr('data-action', 'removeValue').append($('<span>').addClass('fas fa-times'))).get(0).outerHTML;
    }
    fetchFromDom() {
      let selected = [];
      this.$el.find('.list-group .list-group-item').each((i, el) => {
        let value = $(el).data('value').toString();
        let groupItem = this.getGroupValueById(value);
        if (groupItem) {
          selected.push(groupItem);
          return;
        }
        selected.push(value);
      });
      this.selected = selected;
    }
    getGroupIndexById(id) {
      for (let i = 0; i < this.selected.length; i++) {
        let item = this.selected[i];
        if (item && typeof item === 'object') {
          if (item.id === id) {
            return i;
          }
        }
      }
      return -1;
    }
    getGroupValueById(id) {
      for (let item of this.selected) {
        if (item && typeof item === 'object') {
          if (item.id === id) {
            return item;
          }
        }
      }
      return null;
    }
    editGroup(id) {
      let item = Espo.Utils.cloneDeep(this.getGroupValueById(id) || {});
      let index = this.getGroupIndexById(id);
      let tabList = Espo.Utils.cloneDeep(this.selected);
      let view = item.type === 'divider' ? 'views/settings/modals/edit-tab-divider' : 'views/settings/modals/edit-tab-group';
      this.createView('dialog', view, {
        itemData: item
      }, view => {
        view.render();
        this.listenToOnce(view, 'apply', itemData => {
          for (let a in itemData) {
            tabList[index][a] = itemData[a];
          }
          this.model.set(this.name, tabList);
          view.close();
        });
      });
    }
    getAddItemModalOptions() {
      return {
        ...super.getAddItemModalOptions(),
        noGroups: this.noGroups
      };
    }
    getValueForDisplay() {
      const labels = this.translatedOptions || {};

      /** @var {string[]} */
      const list = this.selected.map(item => {
        if (typeof item !== 'string') {
          return ' - ' + (item.text || '?');
        }
        return labels[item] || item;
      });
      return list.map(text => {
        return $('<div>').addClass('multi-enum-item-container').text(text).get(0).outerHTML;
      }).join('');
    }
  }
  var _default = TabListFieldView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/quick-create-list', ['views/fields/array'], function (Dep) {

    return Dep.extend({

        setup: function () {

            this.params.options =  Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                        return;
                    }

                    return this.getMetadata().get('scopes.' + scope + '.entity') &&
                        this.getMetadata().get('scopes.' + scope + '.object');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

define("views/import/record/panels/imported", ["exports", "views/record/panels/relationship"], function (_exports, _relationship) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _relationship = _interopRequireDefault(_relationship);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportImportedPanelView extends _relationship.default {
    link = 'imported';
    readOnly = true;
    rowActionsView = 'views/record/row-actions/relationship-no-unlink';
    setup() {
      this.entityType = this.model.get('entityType');
      this.title = this.title || this.translate('Imported', 'labels', 'Import');
      super.setup();
    }
  }
  var _default = ImportImportedPanelView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);
            this.listenToInsertField();


            this.hideField('insertField');

            this.on('before:set-edit-mode', function () {
                this.showField('insertField');
            }, this);

            this.on('before:set-detail-mode', function () {
                this.hideField('insertField');
            }, this);
        },

        listenToInsertField: function () {
            this.listenTo(this.model, 'insert-field', function (o) {
                var tag = '{' + o.entityType + '.' + o.field + '}';

                var bodyView = this.getFieldView('body');
                if (!bodyView) return;

                if (this.model.get('isHtml')) {
                    var $anchor = $(window.getSelection().anchorNode);
                    if (!$anchor.closest('.note-editing-area').length) return;
                    bodyView.$summernote.summernote('insertText', tag);
                } else {
                    var $body = bodyView.$element;
                    var text = $body.val();
                    text += tag;
                    $body.val(text);
                }
            }, this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupFieldsBehaviour();
            this.initSslFieldListening();
            this.initSmtpFieldsControl();

            if (this.getUser().isAdmin()) {
                this.setFieldNotReadOnly('assignedUser');
            } else {
                this.setFieldReadOnly('assignedUser');
            }
        },

        modifyDetailLayout: function (layout) {
            layout.filter(panel => panel.tabLabel === '$label:SMTP').forEach(panel => {
                panel.rows.forEach(row => {
                    row.forEach(item => {
                        let labelText = this.translate(item.name, 'fields', 'EmailAccount');

                        if (labelText && labelText.indexOf('SMTP ') === 0) {
                            item.labelText = Espo.Utils.upperCaseFirst(labelText.substring(5));
                        }
                    });
                })
            });
        },

        setupFieldsBehaviour: function () {
            this.controlStatusField();

            this.listenTo(this.model, 'change:status', (model, value, o) => {
                if (o.ui) {
                    this.controlStatusField();
                }
            });

            this.listenTo(this.model, 'change:useImap', (model, value, o) => {
                if (o.ui) {
                    this.controlStatusField();
                }
            });

            if (this.wasFetched()) {
                this.setFieldReadOnly('fetchSince');
            } else {
                this.setFieldNotReadOnly('fetchSince');
            }
        },

        controlStatusField: function () {
            let list = ['username', 'port', 'host', 'monitoredFolders'];

            if (this.model.get('status') === 'Active' && this.model.get('useImap')) {
                list.forEach(item => {
                    this.setFieldRequired(item);
                });

                return;
            }

            list.forEach(item => {
                this.setFieldNotRequired(item);
            });
        },

        wasFetched: function () {
            if (!this.model.isNew()) {
                return !!((this.model.get('fetchData') || {}).lastUID);
            }

            return false;
        },

        initSslFieldListening: function () {
            this.listenTo(this.model, 'change:security', (model, value, o) => {
                if (!o.ui) {
                    return;
                }

                if (value) {
                    this.model.set('port', 993);
                } else {
                    this.model.set('port', 143);
                }
            });

            this.listenTo(this.model, 'change:smtpSecurity', (model, value, o) => {
                if (o.ui) {
                    if (value === 'SSL') {
                        this.model.set('smtpPort', 465);
                    } else if (value === 'TLS') {
                        this.model.set('smtpPort', 587);
                    } else {
                        this.model.set('smtpPort', 25);
                    }
                }
            });
        },

        initSmtpFieldsControl: function () {
            this.controlSmtpFields();

            this.listenTo(this.model, 'change:useSmtp', this.controlSmtpFields, this);
            this.listenTo(this.model, 'change:smtpAuth', this.controlSmtpFields, this);
        },

        controlSmtpFields: function () {
            if (this.model.get('useSmtp')) {
                this.showField('smtpHost');
                this.showField('smtpPort');
                this.showField('smtpAuth');
                this.showField('smtpSecurity');
                this.showField('smtpTestSend');

                this.setFieldRequired('smtpHost');
                this.setFieldRequired('smtpPort');

                this.controlSmtpAuthField();

                return;
            }

            this.hideField('smtpHost');
            this.hideField('smtpPort');
            this.hideField('smtpAuth');
            this.hideField('smtpUsername');
            this.hideField('smtpPassword');
            this.hideField('smtpAuthMechanism');
            this.hideField('smtpSecurity');
            this.hideField('smtpTestSend');

            this.setFieldNotRequired('smtpHost');
            this.setFieldNotRequired('smtpPort');
            this.setFieldNotRequired('smtpUsername');
        },

        controlSmtpAuthField: function () {
            if (this.model.get('smtpAuth')) {
                this.showField('smtpUsername');
                this.showField('smtpPassword');
                this.showField('smtpAuthMechanism');
                this.setFieldRequired('smtpUsername');

                return;
            }

            this.hideField('smtpUsername');
            this.hideField('smtpPassword');
            this.hideField('smtpAuthMechanism');
            this.setFieldNotRequired('smtpUsername');
        },
    });
});

define("views/email/detail", ["exports", "views/detail", "email-helper"], function (_exports, _detail, _emailHelper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
  _emailHelper = _interopRequireDefault(_emailHelper);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailDetailView extends _detail.default {
    setup() {
      super.setup();
      const status = this.model.get('status');
      if (status === 'Draft') {
        this.menu = {
          'buttons': [],
          'dropdown': [],
          'actions': []
        };
      } else {
        this.addMenuItem('buttons', {
          name: 'reply',
          label: 'Reply',
          action: this.getPreferences().get('emailReplyToAllByDefault') ? 'replyToAll' : 'reply',
          style: 'danger',
          className: 'btn-s-wide'
        }, true);
        this.addMenuItem('dropdown', false);
        if (status === 'Archived') {
          if (!this.model.get('parentId')) {
            this.addMenuItem('dropdown', {
              label: 'Create Lead',
              action: 'createLead',
              acl: 'create',
              aclScope: 'Lead'
            });
            this.addMenuItem('dropdown', {
              label: 'Create Contact',
              action: 'createContact',
              acl: 'create',
              aclScope: 'Contact'
            });
          }
        }
        this.addMenuItem('dropdown', {
          label: 'Create Task',
          action: 'createTask',
          acl: 'create',
          aclScope: 'Task'
        });
        if (this.model.get('parentType') !== 'Case' || !this.model.get('parentId')) {
          this.addMenuItem('dropdown', {
            label: 'Create Case',
            action: 'createCase',
            acl: 'create',
            aclScope: 'Case'
          });
        }
        if (this.getAcl().checkScope('Document', 'create')) {
          if (this.model.get('attachmentsIds') === undefined || this.model.getLinkMultipleIdList('attachments').length) {
            this.addMenuItem('dropdown', {
              text: this.translate('Create Document', 'labels', 'Document'),
              action: 'createDocument',
              acl: 'create',
              aclScope: 'Document',
              hidden: this.model.get('attachmentsIds') === undefined
            });
            if (this.model.get('attachmentsIds') === undefined) {
              this.listenToOnce(this.model, 'sync', () => {
                if (this.model.getLinkMultipleIdList('attachments').length) {
                  this.showHeaderActionItem('createDocument');
                }
              });
            }
          }
        }
      }
      this.listenTo(this.model, 'change', () => {
        if (!this.isRendered()) {
          return;
        }
        if (!this.model.hasChanged('isImportant') && !this.model.hasChanged('inTrash')) {
          return;
        }
        const headerView = this.getHeaderView();
        if (headerView) {
          headerView.reRender();
        }
      });
      this.shortcutKeys['Control+Delete'] = e => {
        if ($(e.target).hasClass('note-editable')) {
          return;
        }
        const recordView = /** @type {module:views/email/record/detail} */this.getRecordView();
        if (!this.model.get('isUsers') || this.model.get('inTrash')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        recordView.actionMoveToTrash();
      };
      this.shortcutKeys['Control+KeyI'] = e => {
        if ($(e.target).hasClass('note-editable')) {
          return;
        }
        const recordView = /** @type {module:views/email/record/detail} */this.getRecordView();
        if (!this.model.get('isUsers')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.model.get('isImportant') ? recordView.actionMarkAsNotImportant() : recordView.actionMarkAsImportant();
      };
      this.shortcutKeys['Control+KeyM'] = e => {
        if ($(e.target).hasClass('note-editable')) {
          return;
        }
        const recordView = /** @type {module:views/email/record/detail} */this.getRecordView();
        if (!this.model.get('isUsers')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        recordView.actionMoveToFolder();
      };
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateLead() {
      const attributes = {};
      const emailHelper = new _emailHelper.default(this.getLanguage(), this.getUser(), this.getDateTime(), this.getAcl());
      const fromString = this.model.get('fromString') || this.model.get('fromName');
      if (fromString) {
        const fromName = emailHelper.parseNameFromStringAddress(fromString);
        if (fromName) {
          const firstName = fromName.split(' ').slice(0, -1).join(' ');
          const lastName = fromName.split(' ').slice(-1).join(' ');
          attributes.firstName = firstName;
          attributes.lastName = lastName;
        }
      }
      if (this.model.get('replyToString')) {
        const str = this.model.get('replyToString');
        const p = str.split(';')[0];
        attributes.emailAddress = emailHelper.parseAddressFromStringAddress(p);
        const fromName = emailHelper.parseNameFromStringAddress(p);
        if (fromName) {
          const firstName = fromName.split(' ').slice(0, -1).join(' ');
          const lastName = fromName.split(' ').slice(-1).join(' ');
          attributes.firstName = firstName;
          attributes.lastName = lastName;
        }
      }
      if (!attributes.emailAddress) {
        attributes.emailAddress = this.model.get('from');
      }
      attributes.emailId = this.model.id;
      const viewName = this.getMetadata().get('clientDefs.Lead.modalViews.edit') || 'views/modals/edit';
      Espo.Ui.notify(' ... ');
      this.createView('quickCreate', viewName, {
        scope: 'Lead',
        attributes: attributes
      }, view => {
        view.render();
        view.notify(false);
        this.listenTo(view, 'before:save', () => {
          this.getRecordView().blockUpdateWebSocket(true);
        });
        this.listenToOnce(view, 'after:save', () => {
          this.model.fetch();
          this.removeMenuItem('createContact');
          this.removeMenuItem('createLead');
          view.close();
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateCase() {
      const attributes = {};
      const parentId = this.model.get('parentId');
      const parentType = this.model.get('parentType');
      const parentName = this.model.get('parentName');
      const accountId = this.model.get('accountId');
      const accountName = this.model.get('accountName');
      if (parentId) {
        if (parentType === 'Account') {
          attributes.accountId = parentId;
          attributes.accountName = parentName;
        } else if (parentType === 'Contact') {
          attributes.contactId = parentId;
          attributes.contactName = parentName;
          attributes.contactsIds = [parentId];
          attributes.contactsNames = {};
          attributes.contactsNames[parentId] = parentName;
          if (accountId) {
            attributes.accountId = accountId;
            attributes.accountName = accountName || accountId;
          }
        } else if (parentType === 'Lead') {
          attributes.leadId = parentId;
          attributes.leadName = parentName;
        }
      }
      attributes.emailsIds = [this.model.id];
      attributes.emailId = this.model.id;
      attributes.name = this.model.get('name');
      attributes.description = this.model.get('bodyPlain') || '';
      const viewName = this.getMetadata().get('clientDefs.Case.modalViews.edit') || 'views/modals/edit';
      Espo.Ui.notify(' ... ');
      new Promise(resolve => {
        if (!(this.model.get('attachmentsIds') || []).length) {
          resolve();
          return;
        }
        Espo.Ajax.postRequest(`Email/${this.model.id}/attachments/copy`, {
          parentType: 'Case',
          field: 'attachments'
        }).then(data => {
          attributes.attachmentsIds = data.ids;
          attributes.attachmentsNames = data.names;
          resolve();
        });
      }).then(() => {
        this.createView('quickCreate', viewName, {
          scope: 'Case',
          attributes: attributes
        }, view => {
          view.render();
          Espo.Ui.notify(false);
          this.listenToOnce(view, 'after:save', () => {
            this.model.fetch();
            this.removeMenuItem('createCase');
            view.close();
          });
          this.listenTo(view, 'before:save', () => {
            this.getRecordView().blockUpdateWebSocket(true);
          });
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateTask() {
      const attributes = {};
      attributes.parentId = this.model.get('parentId');
      attributes.parentName = this.model.get('parentName');
      attributes.parentType = this.model.get('parentType');
      attributes.emailId = this.model.id;
      const subject = this.model.get('name');
      attributes.description = '[' + this.translate('Email', 'scopeNames') + ': ' + subject + ']' + '(#Email/view/' + this.model.id + ')\n';
      const viewName = this.getMetadata().get('clientDefs.Task.modalViews.edit') || 'views/modals/edit';
      Espo.Ui.notify(' ... ');
      this.createView('quickCreate', viewName, {
        scope: 'Task',
        attributes: attributes
      }, view => {
        const recordView = view.getRecordView();
        const nameFieldView = recordView.getFieldView('name');
        let nameOptionList = [];
        if (nameFieldView && nameFieldView.params.options) {
          nameOptionList = nameOptionList.concat(nameFieldView.params.options);
        }
        nameOptionList.push(this.translate('replyToEmail', 'nameOptions', 'Task'));
        recordView.setFieldOptionList('name', nameOptionList);
        view.render();
        view.notify(false);
        this.listenToOnce(view, 'after:save', () => {
          view.close();
          this.model.fetch();
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateContact() {
      const attributes = {};
      const emailHelper = new _emailHelper.default(this.getLanguage(), this.getUser(), this.getDateTime(), this.getAcl());
      const fromString = this.model.get('fromString') || this.model.get('fromName');
      if (fromString) {
        const fromName = emailHelper.parseNameFromStringAddress(fromString);
        if (fromName) {
          const firstName = fromName.split(' ').slice(0, -1).join(' ');
          const lastName = fromName.split(' ').slice(-1).join(' ');
          attributes.firstName = firstName;
          attributes.lastName = lastName;
        }
      }
      if (this.model.get('replyToString')) {
        const str = this.model.get('replyToString');
        const p = str.split(';')[0];
        attributes.emailAddress = emailHelper.parseAddressFromStringAddress(p);
        const fromName = emailHelper.parseNameFromStringAddress(p);
        if (fromName) {
          const firstName = fromName.split(' ').slice(0, -1).join(' ');
          const lastName = fromName.split(' ').slice(-1).join(' ');
          attributes.firstName = firstName;
          attributes.lastName = lastName;
        }
      }
      if (!attributes.emailAddress) {
        attributes.emailAddress = this.model.get('from');
      }
      attributes.emailId = this.model.id;
      const viewName = this.getMetadata().get('clientDefs.Contact.modalViews.edit') || 'views/modals/edit';
      Espo.Ui.notify(' ... ');
      this.createView('quickCreate', viewName, {
        scope: 'Contact',
        attributes: attributes
      }, view => {
        view.render();
        view.notify(false);
        this.listenToOnce(view, 'after:save', () => {
          this.model.fetch();
          this.removeMenuItem('createContact');
          this.removeMenuItem('createLead');
          view.close();
        });
        this.listenTo(view, 'before:save', () => {
          this.getRecordView().blockUpdateWebSocket(true);
        });
      });
    }
    actionReply(data, e, cc) {
      const emailHelper = new _emailHelper.default(this.getLanguage(), this.getUser(), this.getDateTime(), this.getAcl());
      const attributes = emailHelper.getReplyAttributes(this.model, data, cc);
      Espo.Ui.notify(' ... ');
      const viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
      this.createView('quickCreate', viewName, {
        attributes: attributes,
        focusForCreate: true
      }, view => {
        view.render();
        view.notify(false);
        this.listenTo(view, 'after:save', () => {
          this.model.fetch();
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionReplyToAll(data, e) {
      this.actionReply(data, e, true);
    }

    // noinspection JSUnusedGlobalSymbols
    actionForward() {
      const emailHelper = new _emailHelper.default(this.getLanguage(), this.getUser(), this.getDateTime(), this.getAcl());
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('Email/action/getDuplicateAttributes', {
        id: this.model.id
      }).then(duplicateAttributes => {
        const model = this.model.clone();
        model.set('body', duplicateAttributes.body);
        const attributes = emailHelper.getForwardAttributes(model);
        attributes.attachmentsIds = duplicateAttributes.attachmentsIds;
        attributes.attachmentsNames = duplicateAttributes.attachmentsNames;
        Espo.Ui.notify(' ... ');
        const viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
        this.createView('quickCreate', viewName, {
          attributes: attributes
        }, view => {
          view.render();
          view.notify(false);
        });
      });
    }
    getHeader() {
      const name = this.model.get('name');
      const isImportant = this.model.get('isImportant');
      const inTrash = this.model.get('inTrash');
      const rootUrl = this.options.rootUrl || this.options.params.rootUrl || '#' + this.scope;
      const headerIconHtml = this.getHeaderIconHtml();
      let $root = $('<a>').attr('href', rootUrl).attr('data-action', 'navigateToRoot').addClass('action').text(this.getLanguage().translate(this.model.name, 'scopeNamesPlural'));
      if (headerIconHtml) {
        $root = $('<span>').append(headerIconHtml, $root).get(0).innerHTML;
      }
      return this.buildHeaderHtml([$root, $('<span>').addClass('font-size-flexible title').addClass(isImportant ? 'text-warning' : '').addClass(inTrash ? 'text-muted' : '').text(name)]);
    }
    actionNavigateToRoot(data, event) {
      event.stopPropagation();
      this.getRouter().checkConfirmLeaveOut(() => {
        const rootUrl = this.options.rootUrl || this.options.params.rootUrl || '#' + this.scope;
        const options = {
          isReturn: true,
          isReturnThroughLink: true
        };
        this.getRouter().navigate(rootUrl, {
          trigger: false
        });
        this.getRouter().dispatch(this.scope, null, options);
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateDocument() {
      const attachmentIdList = this.model.getLinkMultipleIdList('attachments');
      if (!attachmentIdList.length) {
        return;
      }
      const names = this.model.get('attachmentsNames') || {};
      const types = this.model.get('attachmentsTypes') || {};
      const proceed = id => {
        const attributes = {};
        if (this.model.get('accountId')) {
          attributes.accountsIds = [this.model.get('accountId')];
          attributes.accountsNames = {};
          attributes.accountsNames[this.model.get('accountId')] = this.model.get('accountName');
        }
        Espo.Ui.notify(' ... ');
        Espo.Ajax.postRequest('Attachment/copy/' + id, {
          relatedType: 'Document',
          field: 'file'
        }).then(attachment => {
          attributes.fileId = attachment.id;
          attributes.fileName = attachment.name;
          attributes.name = attachment.name;
          const viewName = this.getMetadata().get('clientDefs.Document.modalViews.edit') || 'views/modals/edit';
          this.createView('quickCreate', viewName, {
            scope: 'Document',
            attributes: attributes
          }, view => {
            view.render();
            Espo.Ui.notify(false);
            this.listenToOnce(view, 'after:save', () => {
              view.close();
            });
          });
        });
      };
      if (attachmentIdList.length === 1) {
        proceed(attachmentIdList[0]);
        return;
      }
      const dataList = [];
      attachmentIdList.forEach(id => {
        dataList.push({
          id: id,
          name: names[id] || id,
          type: types[id]
        });
      });
      this.createView('dialog', 'views/attachment/modals/select-one', {
        dataList: dataList,
        fieldLabel: this.translate('attachments', 'fields', 'Email')
      }, view => {
        view.render();
        this.listenToOnce(view, 'select', proceed.bind(this));
      });
    }
  }
  var _default = EmailDetailView;
  _exports.default = _default;
});

define("views/email/record/list", ["exports", "views/record/list", "helpers/mass-action"], function (_exports, _list, _massAction) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _list = _interopRequireDefault(_list);
  _massAction = _interopRequireDefault(_massAction);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/email/record/list */

  class EmailListRecordView extends _list.default {
    rowActionsView = 'views/email/record/row-actions/default';
    massActionList = ['remove', 'massUpdate'];
    setup() {
      super.setup();
      if (this.collection.url === this.entityType) {
        this.addMassAction('retrieveFromTrash', false, true);
        this.addMassAction('moveToFolder', true, true);
        this.addMassAction('markAsNotImportant', false, true);
        this.addMassAction('markAsImportant', false, true);
        this.addMassAction('markAsNotRead', false, true);
        this.addMassAction('markAsRead', false, true);
        this.addMassAction('moveToTrash', false, true);
        this.dropdownItemList.push({
          name: 'markAllAsRead',
          label: 'Mark all as read'
        });
      }
      this.listenTo(this.collection, 'moving-to-trash', id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('inTrash', true);
        }
        if (this.collection.selectedFolderId !== 'trash' && this.collection.selectedFolderId !== 'all') {
          this.removeRecordFromList(id);
        }
      });
      this.listenTo(this.collection, 'retrieving-from-trash', id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('inTrash', false);
        }
        if (this.collection.selectedFolderId === 'trash') {
          this.removeRecordFromList(id);
        }
      });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMarkAsRead() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.postRequest('Email/inbox/read', {
        ids: ids
      });
      ids.forEach(id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('isRead', true);
        }
      });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMarkAsNotRead() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.deleteRequest('Email/inbox/read', {
        ids: ids
      });
      ids.forEach(id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('isRead', false);
        }
      });
    }
    massActionMarkAsImportant() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.postRequest('Email/inbox/important', {
        ids: ids
      });
      ids.forEach(id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('isImportant', true);
        }
      });
    }
    massActionMarkAsNotImportant() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.deleteRequest('Email/inbox/important', {
        ids: ids
      });
      ids.forEach(id => {
        const model = this.collection.get(id);
        if (model) {
          model.set('isImportant', false);
        }
      });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMoveToTrash() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.postRequest('Email/inbox/inTrash', {
        ids: ids
      }).then(() => {
        Espo.Ui.warning(this.translate('Moved to Trash', 'labels', 'Email'));
      });
      if (this.collection.selectedFolderId === 'trash') {
        return;
      }
      ids.forEach(id => {
        this.collection.trigger('moving-to-trash', id, this.collection.get(id));
        this.uncheckRecord(id, null, true);
      });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionRetrieveFromTrash() {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.deleteRequest('Email/inbox/inTrash', {
        ids: ids
      }).then(() => {
        Espo.Ui.success(this.translate('Done'));
      });
      if (this.collection.selectedFolderId !== 'trash') {
        return;
      }
      ids.forEach(id => {
        this.collection.trigger('retrieving-from-trash', id, this.collection.get(id));
        this.uncheckRecord(id, null, true);
      });
    }
    massMoveToFolder(folderId) {
      const params = this.getMassActionSelectionPostData();
      const helper = new _massAction.default(this);
      const idle = !!params.searchParams && helper.checkIsIdle();
      Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
      Espo.Ajax.postRequest('MassAction', {
        entityType: this.entityType,
        action: 'moveToFolder',
        params: params,
        idle: idle,
        data: {
          folderId: folderId
        }
      }).then(result => {
        Espo.Ui.notify(false);
        if (result.id) {
          helper.process(result.id, 'moveToFolder').then(view => {
            this.listenToOnce(view, 'close:success', () => {
              this.collection.fetch().then(() => {
                Espo.Ui.success(this.translate('Done'));
              });
            });
          });
          return;
        }
        this.collection.fetch().then(() => {
          Espo.Ui.success(this.translate('Done'));
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    massActionMoveToFolder() {
      this.createView('dialog', 'views/email-folder/modals/select-folder', {
        headerText: this.translate('Move to Folder', 'labels', 'Email')
      }, view => {
        view.render();
        this.listenToOnce(view, 'select', folderId => {
          this.clearView('dialog');
          this.massMoveToFolder(folderId);
        });
      });
    }
    actionMarkAsImportant(data) {
      data = data || {};
      const id = data.id;
      Espo.Ajax.postRequest('Email/inbox/important', {
        id: id
      });
      const model = this.collection.get(id);
      if (model) {
        model.set('isImportant', true);
      }
    }
    actionMarkAsNotImportant(data) {
      data = data || {};
      const id = data.id;
      Espo.Ajax.deleteRequest('Email/inbox/important', {
        id: id
      });
      const model = this.collection.get(id);
      if (model) {
        model.set('isImportant', false);
      }
    }

    // noinspection JSUnusedGlobalSymbols
    actionMarkAllAsRead() {
      Espo.Ajax.postRequest('Email/inbox/read', {
        all: true
      });
      this.collection.forEach(model => {
        model.set('isRead', true);
      });
      this.collection.trigger('all-marked-read');
    }
    actionMoveToTrash(data) {
      const id = data.id;
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('Email/inbox/inTrash', {
        id: id
      }).then(() => {
        Espo.Ui.warning(this.translate('Moved to Trash', 'labels', 'Email'));
        this.collection.trigger('moving-to-trash', id, this.collection.get(id));
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionRetrieveFromTrash(data) {
      const id = data.id;
      Espo.Ui.notify(' ... ');
      this.retrieveFromTrash(id).then(() => {
        Espo.Ui.warning(this.translate('Retrieved from Trash', 'labels', 'Email'));
        this.collection.trigger('retrieving-from-trash', id, this.collection.get(id));
      });
    }

    /**
     * @param {string} id
     * @return {Promise}
     */
    retrieveFromTrash(id) {
      return Espo.Ajax.deleteRequest('Email/inbox/inTrash', {
        id: id
      });
    }
    massRetrieveFromTrashMoveToFolder(folderId) {
      const ids = [];
      for (const i in this.checkedList) {
        ids.push(this.checkedList[i]);
      }
      Espo.Ajax.deleteRequest('Email/inbox/inTrash', {
        ids: ids
      }).then(() => {
        ids.forEach(id => {
          this.collection.trigger('retrieving-from-trash', id, this.collection.get(id));
        });
        return Espo.Ajax.postRequest(`Email/inbox/folders/${folderId}`, {
          ids: ids
        }).then(() => {
          Espo.Ui.success(this.translate('Done'));
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @todo Use one API request.
     */
    actionRetrieveFromTrashMoveToFolder(data) {
      const id = data.id;
      const folderId = data.folderId;
      Espo.Ui.notify(' ... ');
      this.retrieveFromTrash(id).then(() => {
        return this.moveToFolder(id, folderId);
      }).then(() => {
        this.collection.fetch().then(() => {
          Espo.Ui.success(this.translate('Done'));
        });
      });
    }

    /**
     * @param {string} id
     * @param {string} folderId
     * @return {Promise}
     */
    moveToFolder(id, folderId) {
      return Espo.Ajax.postRequest(`Email/inbox/folders/${folderId}`, {
        id: id
      });
    }
    actionMoveToFolder(data) {
      const id = data.id;
      const folderId = data.folderId;
      if (folderId) {
        Espo.Ui.notify(' ... ');
        this.moveToFolder(id, folderId).then(() => {
          this.collection.fetch().then(() => {
            Espo.Ui.success(this.translate('Done'));
          });
        });
        return;
      }
      this.createView('dialog', 'views/email-folder/modals/select-folder', {
        headerText: this.translate('Move to Folder', 'labels', 'Email')
      }, view => {
        view.render();
        this.listenToOnce(view, 'select', folderId => {
          this.clearView('dialog');
          Espo.Ui.notify(' ... ');
          this.moveToFolder(id, folderId).then(() => {
            this.collection.fetch().then(() => {
              Espo.Ui.success(this.translate('Done'));
            });
          });
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionSend(data) {
      const id = data.id;
      this.confirm({
        message: this.translate('sendConfirm', 'messages', 'Email'),
        confirmText: this.translate('Send', 'labels', 'Email')
      }).then(() => {
        const model = this.collection.get(id);
        if (!model) {
          return;
        }
        Espo.Ui.notify(this.translate('Sending...', 'labels', 'Email'));
        model.save({
          status: 'Sending'
        }).then(() => {
          Espo.Ui.success(this.translate('emailSent', 'messages', 'Email'));
          if (this.collection.selectedFolderId === 'drafts') {
            this.removeRecordFromList(id);
            this.uncheckRecord(id, null, true);
            this.collection.trigger('draft-sent');
          }
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    toggleMassMarkAsImportant() {
      const allImportant = !this.checkedList.map(id => this.collection.get(id)).find(m => !m.get('isImportant'));
      if (allImportant) {
        this.massActionMarkAsNotImportant();
        return;
      }
      this.massActionMarkAsImportant();
    }
  }
  var _default = EmailListRecordView;
  _exports.default = _default;
});

define("views/email/record/edit", ["exports", "views/record/edit", "views/email/record/detail"], function (_exports, _edit, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _edit = _interopRequireDefault(_edit);
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/email/record/edit */

  class EmailEditRecordView extends _edit.default {
    shortcutKeyCtrlEnterAction = 'send';
    init() {
      super.init();
      _detail.default.prototype.layoutNameConfigure.call(this);
    }
    setup() {
      super.setup();
      if (['Archived', 'Sent'].includes(this.model.get('status'))) {
        this.shortcutKeyCtrlEnterAction = 'save';
      }
      this.addButton({
        name: 'send',
        label: 'Send',
        style: 'primary',
        title: 'Ctrl+Enter'
      }, true);
      this.addButton({
        name: 'saveDraft',
        label: 'Save Draft',
        title: 'Ctrl+S'
      }, true);
      this.controlSendButton();
      if (this.model.get('status') === 'Draft') {
        this.setFieldReadOnly('dateSent');

        // Not implemented for detail view yet.
        this.hideField('selectTemplate');
      }
      this.handleAttachmentField();
      this.handleCcField();
      this.handleBccField();
      this.listenTo(this.model, 'change:attachmentsIds', () => this.handleAttachmentField());
      this.listenTo(this.model, 'change:cc', () => this.handleCcField());
      this.listenTo(this.model, 'change:bcc', () => this.handleBccField());
    }
    handleAttachmentField() {
      if ((this.model.get('attachmentsIds') || []).length === 0 && !this.isNew && this.model.get('status') !== 'Draft') {
        this.hideField('attachments');
        return;
      }
      this.showField('attachments');
    }
    handleCcField() {
      if (!this.model.get('cc') && this.model.get('status') !== 'Draft') {
        this.hideField('cc');
      } else {
        this.showField('cc');
      }
    }
    handleBccField() {
      if (!this.model.get('bcc') && this.model.get('status') !== 'Draft') {
        this.hideField('bcc');
      } else {
        this.showField('bcc');
      }
    }
    controlSendButton() {
      const status = this.model.get('status');
      if (status === 'Draft') {
        this.showActionItem('send');
        this.showActionItem('saveDraft');
        this.hideActionItem('save');
        this.hideActionItem('saveAndContinueEditing');
        return;
      }
      this.hideActionItem('send');
      this.hideActionItem('saveDraft');
      this.showActionItem('save');
      this.showActionItem('saveAndContinueEditing');
    }

    // noinspection JSUnusedGlobalSymbols
    actionSaveDraft() {
      this.actionSaveAndContinueEditing();
    }

    // noinspection JSUnusedGlobalSymbols
    actionSend() {
      _detail.default.prototype.send.call(this).then(() => this.exit()).catch(() => {});
    }

    /**
     * @protected
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyCtrlS(e) {
      if (this.inlineEditModeIsOn || this.buttonsDisabled) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (this.mode !== this.MODE_EDIT) {
        return;
      }
      if (!this.saveAndContinueEditingAction) {
        return;
      }
      if (!this.hasAvailableActionItem('saveDraft') && !this.hasAvailableActionItem('saveAndContinueEditing')) {
        return;
      }
      this.actionSaveAndContinueEditing();
    }
  }
  var _default = EmailEditRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/person-string-data', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        listTemplate: 'email/fields/person-string-data/list',

        getAttributeList: function () {
            return ['personStringData', 'isReplied'];
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            data.isReplied = this.model.get('isReplied');

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define(
    'views/email/fields/from-address-varchar',
    ['views/fields/base', 'views/email/fields/email-address', 'helpers/record-modal'],
    function (Dep, EmailAddress, RecordModal) {

    return Dep.extend({

        detailTemplate: 'email/fields/email-address-varchar/detail',

        validations: ['required', 'email'],

        skipCurrentInAutocomplete: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.erasedPlaceholder = 'ERASED:';

            this.on('render', () => {
                if (this.mode === this.MODE_SEARCH) {
                    return;
                }

                this.initAddressList();
            });
        },

        events: {
            'click [data-action="createContact"]': function (e) {
                var address = $(e.currentTarget).data('address');
                this.createPerson('Contact', address);
            },
            'click [data-action="createLead"]': function (e) {
                var address = $(e.currentTarget).data('address');
                this.createPerson('Lead', address);
            },
            'click [data-action="addToContact"]': function (e) {
                var address = $(e.currentTarget).data('address');
                this.addToPerson('Contact', address);
            },
            'click [data-action="addToLead"]': function (e) {
                var address = $(e.currentTarget).data('address');
                this.addToPerson('Lead', address);
            },
            'auxclick a[href][data-scope][data-id]': function (e) {
                let isCombination = e.button === 1 && (e.ctrlKey || e.metaKey);

                if (!isCombination) {
                    return;
                }

                let $target = $(e.currentTarget);

                let id = $target.attr('data-id');
                let scope = $target.attr('data-scope');

                e.preventDefault();
                e.stopPropagation();

                this.quickView({
                    id: id,
                    scope: scope,
                });
            },
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            var address = this.model.get(this.name);
            if (address && !(address in this.idHash) && this.model.get('parentId')) {
                if (this.getAcl().check('Contact', 'edit')) {
                    data.showCreate = true;
                }
            }

            data.valueIsSet = this.model.has(this.name);

            return data;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === this.MODE_SEARCH && this.getAcl().check('Email', 'create')) {
                EmailAddress.prototype.initSearchAutocomplete.call(this);
            }

            if (this.mode === this.MODE_EDIT && this.getAcl().check('Email', 'create')) {
                EmailAddress.prototype.initSearchAutocomplete.call(this);
            }

            if (this.mode === this.MODE_SEARCH) {
                this.$input.on('input', () => {
                    this.trigger('change');
                });
            }
        },

        getAutocompleteMaxCount: function () {
            return EmailAddress.prototype.getAutocompleteMaxCount.call(this);
        },

        initAddressList: function () {
            this.nameHash = {};
            this.typeHash = this.model.get('typeHash') || {};
            this.idHash = this.model.get('idHash') || {};

            _.extend(this.nameHash, this.model.get('nameHash') || {});
        },

        getAttributeList: function () {
            var list = Dep.prototype.getAttributeList.call(this);

            list.push('nameHash');
            list.push('idHash');
            list.push('accountId');

            return list;
        },

        getValueForDisplay: function () {
            if (this.mode === this.MODE_DETAIL) {
                var address = this.model.get(this.name);

                return this.getDetailAddressHtml(address);
            }

            return Dep.prototype.getValueForDisplay.call(this);
        },

        getDetailAddressHtml: function (address) {
            if (!address) {
                return '';
            }

            let fromString = this.model.get('fromString') || this.model.get('fromName');

            let name = this.nameHash[address] || this.parseNameFromStringAddress(fromString) || null;

            let entityType = this.typeHash[address] || null;
            let id = this.idHash[address] || null;

            if (id) {
                return $('<div>')
                    .append(
                        $('<a>')
                            .attr('href', `#${entityType}/view/${id}`)
                            .attr('data-scope', entityType)
                            .attr('data-id', id)
                            .text(name),
                        ' ',
                        $('<span>').addClass('text-muted chevron-right'),
                        ' ',
                        $('<span>').text(address)
                    )
                    .get(0).outerHTML;
            }

            let $div = $('<div>');

            if (this.getAcl().check('Contact', 'create') || this.getAcl().check('Lead', 'create')) {
                $div.append(
                    this.getCreateHtml(address)
                );
            }

            if (name) {
                $div.append(
                    $('<span>')
                        .addClass('email-address-line')
                        .text(name)
                        .append(
                            ' ',
                            $('<span>').addClass('text-muted chevron-right'),
                            ' ',
                            $('<span>').text(address)
                        )
                );

                return $div.get(0).outerHTML;
            }

            $div.append(
                $('<span>')
                    .addClass('email-address-line')
                    .text(address)
            )


            return $div.get(0).outerHTML;
        },

        getCreateHtml: function (address) {
            let $ul = $('<ul>')
                .addClass('dropdown-menu')
                .attr('role', 'menu');

            let $container = $('<span>')
                .addClass('dropdown email-address-create-dropdown pull-right')
                .append(
                    $('<button>')
                        .addClass('dropdown-toggle btn btn-link btn-sm')
                        .attr('data-toggle', 'dropdown')
                        .append(
                            $('<span>').addClass('caret text-muted')
                        ),
                    $ul
                );

            if (this.getAcl().check('Contact', 'create')) {
                $ul.append(
                    $('<li>')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .attr('data-action', 'createContact')
                                .attr('data-address', address)
                                .text(this.translate('Create Contact', 'labels', 'Email'))
                        )
                );
            }

            if (this.getAcl().check('Lead', 'create')) {
                $ul.append(
                    $('<li>')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .attr('data-action', 'createLead')
                                .attr('data-address', address)
                                .text(this.translate('Create Lead', 'labels', 'Email'))
                        )
                );
            }

            if (this.getAcl().check('Contact', 'edit')) {
                $ul.append(
                    $('<li>')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .attr('data-action', 'addToContact')
                                .attr('data-address', address)
                                .text(this.translate('Add to Contact', 'labels', 'Email'))
                        )
                );
            }

            if (this.getAcl().check('Lead', 'edit')) {
                $ul.append(
                    $('<li>')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .attr('data-action', 'addToLead')
                                .attr('data-address', address)
                                .text(this.translate('Add to Lead', 'labels', 'Email'))
                        )
                );
            }

            return $container.get(0).outerHTML;
        },

        parseNameFromStringAddress: function (value) {
            value = value || '';

            if (~value.indexOf('<')) {
                var name = value.replace(/<(.*)>/, '').trim();

                if (name.charAt(0) === '"' && name.charAt(name.length - 1) === '"') {
                    name = name.substr(1, name.length - 2);
                }

                return name;
            }

            return null;
        },

        createPerson: function (scope, address) {
            var fromString = this.model.get('fromString') || this.model.get('fromName');
            var name = this.nameHash[address] || null;

            if (!name) {
                if (this.name === 'from') {
                    name = this.parseNameFromStringAddress(fromString) || null;
                }
            }

            if (name) {
                name = this.getHelper().escapeString(name);
            }

            var attributes = {
                emailAddress: address
            };

            if (this.model.get('accountId') && scope === 'Contact') {
                attributes.accountId = this.model.get('accountId');
                attributes.accountName = this.model.get('accountName');
            }

            if (name) {
                var firstName = name.split(' ').slice(0, -1).join(' ');
                var lastName = name.split(' ').slice(-1).join(' ');

                attributes.firstName = firstName;
                attributes.lastName = lastName;
            }

            var viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.edit') ||
                'views/modals/edit';

            this.createView('create', viewName, {
                scope: scope,
                attributes: attributes
            }, (view) => {
                view.render();

                this.listenTo(view, 'after:save', (model) => {
                    var nameHash = Espo.Utils.clone(this.model.get('nameHash') || {});
                    var typeHash = Espo.Utils.clone(this.model.get('typeHash') || {});
                    var idHash = Espo.Utils.clone(this.model.get('idHash') || {});

                    idHash[address] = model.id;
                    nameHash[address] = model.get('name');
                    typeHash[address] = scope;

                    this.idHash = idHash;
                    this.nameHash = nameHash;
                    this.typeHash = typeHash;

                    var attributes = {
                        nameHash: nameHash,
                        idHash: idHash,
                        typeHash: typeHash
                    };

                    setTimeout(() => {
                        this.model.set(attributes);

                        if (this.model.get('icsContents')) {
                            this.model.fetch();
                        }
                    }, 50);
                });
            });
        },

        addToPerson: function (scope, address) {
            var fromString = this.model.get('fromString') || this.model.get('fromName');
            var name = this.nameHash[address] || null;

            if (!name) {
                if (this.name === 'from') {
                    name = this.parseNameFromStringAddress(fromString) || null;
                }
            }

            if (name) {
                name = this.getHelper().escapeString(name);
            }

            var attributes = {
                emailAddress: address,
            };

            if (this.model.get('accountId') && scope === 'Contact') {
                attributes.accountId = this.model.get('accountId');
                attributes.accountName = this.model.get('accountName');
            }

            var viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.select') ||
                'views/modals/select-records';

            Espo.Ui.notify(' ... ');

            var filters = {};

            if (name) {
                filters['name'] = {
                    type: 'equals',
                    field: 'name',
                    value: name,
                };
            }

            this.createView('dialog', viewName, {
                scope: scope,
                createButton: false,
                filters: filters,
            }, (view) => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', (model) => {
                    var afterSave = () => {
                        var nameHash = Espo.Utils.clone(this.model.get('nameHash') || {});
                        var typeHash = Espo.Utils.clone(this.model.get('typeHash') || {});
                        var idHash = Espo.Utils.clone(this.model.get('idHash') || {});

                        idHash[address] = model.id;
                        nameHash[address] = model.get('name');
                        typeHash[address] = scope;

                        this.idHash = idHash;
                        this.nameHash = nameHash;
                        this.typeHash = typeHash;

                        var attributes = {
                            nameHash: nameHash,
                            idHash: idHash,
                            typeHash: typeHash
                        };

                        setTimeout(() => {
                            this.model.set(attributes);

                            if (this.model.get('icsContents')) {
                                this.model.fetch();
                            }
                        }, 50);
                    };

                    if (!model.get('emailAddress')) {
                        model.save({
                            'emailAddress': address
                        }, {patch: true}).then(afterSave);
                    }
                    else {
                        model.fetch().then(() => {
                            var emailAddressData = model.get('emailAddressData') || [];

                            var item = {
                                emailAddress: address,
                                primary: emailAddressData.length === 0
                            };

                            emailAddressData.push(item);

                            model.save({
                                'emailAddressData': emailAddressData
                            }, {patch: true}).then(afterSave);
                        });
                    }
                });
            });
        },

        fetchSearch: function () {
            var value = this.$element.val().trim();

            if (value) {
                return {
                    type: 'equals',
                    value: value,
                }
            }

            return null;
        },

        validateEmail: function () {
            var address = this.model.get(this.name);

            if (!address) {
                return;
            }

            var addressLowerCase = String(address).toLowerCase();

            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!re.test(addressLowerCase) && address.indexOf(this.erasedPlaceholder) !== 0) {
                var msg = this.translate('fieldShouldBeEmail', 'messages')
                    .replace('{field}', this.getLabelText());

                this.showValidationMessage(msg);

                return true;
            }
        },

        quickView: function (data) {
            let helper = new RecordModal(this.getMetadata(), this.getAcl());

            helper.showDetail(this, {
                id: data.id,
                scope: data.scope,
            });
        },
    });
});

define("helpers/misc/field-language", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module helpers/misc/field-language */

  /**
   * A field-language util.
   */
  class FieldLanguage {
    /**
     * @param {module:metadata} metadata A metadata.
     * @param {module:language} language A language.
     */
    constructor(metadata, language) {
      /**
       * @private
       * @type {module:metadata}
       */
      this.metadata = metadata;

      /**
       * @private
       * @type {module:language}
       */
      this.language = language;
    }

    /**
     * Translate an attribute.
     *
     * @param {string} scope A scope.
     * @param {string} name An attribute name.
     * @returns {string}
     */
    translateAttribute(scope, name) {
      let label = this.language.translate(name, 'fields', scope);
      if (name.indexOf('Id') === name.length - 2) {
        const baseField = name.slice(0, name.length - 2);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('id', 'fields') + ')';
        }
      } else if (name.indexOf('Name') === name.length - 4) {
        const baseField = name.slice(0, name.length - 4);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('name', 'fields') + ')';
        }
      } else if (name.indexOf('Type') === name.length - 4) {
        const baseField = name.slice(0, name.length - 4);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('type', 'fields') + ')';
        }
      }
      if (name.indexOf('Ids') === name.length - 3) {
        const baseField = name.slice(0, name.length - 3);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('ids', 'fields') + ')';
        }
      } else if (name.indexOf('Names') === name.length - 5) {
        const baseField = name.slice(0, name.length - 5);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('names', 'fields') + ')';
        }
      } else if (name.indexOf('Types') === name.length - 5) {
        const baseField = name.slice(0, name.length - 5);
        if (this.metadata.get(['entityDefs', scope, 'fields', baseField])) {
          label = this.language.translate(baseField, 'fields', scope) + ' (' + this.language.translate('types', 'fields') + ')';
        }
      }
      return label;
    }
  }
  var _default = FieldLanguage;
  _exports.default = _default;
});

define("handlers/select-related", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module handlers/select-related */

  /**
   * @typedef Object
   * @name module:handlers/select-related~filters
   * @property {Object.<string, module:search-manager~advancedFilter>} [advanced]
   *  Advanced filters map. A field name as a key.
   * @property {string[]} [bool] Bool filters.
   * @property {string} [primary] A primary filter.
   * @property {string} [orderBy] A field to order by.
   * @property {'asc'|'desc'} [order] An order direction.
   */

  /**
   * Prepares filters for selecting records to relate.
   *
   * @abstract
   */
  class SelectRelatedHandler {
    /**
     * @param {module:view-helper} viewHelper
     */
    constructor(viewHelper) {
      // noinspection JSUnusedGlobalSymbols
      /** @protected */
      this.viewHelper = viewHelper;
    }

    /**
     * Get filters for selecting records to relate.
     *
     * @abstract
     * @param {module:model} model A model.
     * @return {Promise<module:handlers/select-related~filters>} Filters.
     */
    getFilters(model) {
      return Promise.resolve({});
    }
  }
  var _default = SelectRelatedHandler;
  _exports.default = _default;
});

define("handlers/login", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module handlers/login */

  /**
   * Custom login handling. To be extended.
   *
   * @abstract
   */
  class LoginHandler {
    /**
     * @param {module:views/login} loginView A login view.
     * @param {Object.<string, *>} data Additional metadata.
     */
    constructor(loginView, data) {
      /**
       * A login view.
       * @protected
       * @type {module:views/login}
       */
      this.loginView = loginView;

      /**
       * Additional metadata.
       * @protected
       * @type {Object.<string, *>}
       */
      this.data = data;
    }

    /**
     * Process. Called on 'Sign in' button click.
     *
     * @public
     * @abstract
     * @return {Promise<Object.<string, string>>} Resolved with headers to be sent to the `App/user` endpoint.
     */
    process() {
      return Promise.resolve({});
    }
  }
  var _default = LoginHandler;
  _exports.default = _default;
});

define("handlers/map/renderer", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /**
   * @module handlers/map/renderer
   */

  /**
   * A map renderer.
   *
   * @abstract
   */
  class MapRenderer {
    /**
     * @typedef {Object} module:handlers/map/renderer~addressData
     * @property {string|null} street
     * @property {string|null} city
     * @property {string|null} country
     * @property {string|null} state
     * @property {string|null} postalCode
     */

    /**
     * @param {import('views/fields/map').default} view A field view.
     */
    constructor(view) {
      this.view = view;
    }

    /**
     * @param {module:handlers/map/renderer~addressData} addressData
     * @abstract
     */
    render(addressData) {}
  }
  var _default = MapRenderer;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/wysiwyg/modals/insert-link', ['views/modal'], function (Dep) {

    return Dep.extend({

        className: 'dialog dialog-record',

        template: 'wysiwyg/modals/insert-link',

        events: {
            'input [data-name="url"]': function () {
                this.controlInputs();
            },
            'paste [data-name="url"]': function () {
                this.controlInputs();
            },
        },

        shortcutKeys: {
            'Control+Enter': function () {
                if (this.hasAvailableActionItem('insert')) {
                    this.actionInsert();
                }
            },
        },

        data: function () {
            return {
                labels: this.options.labels || {},
            };
        },

        setup: function () {
            let labels = this.options.labels || {};

            this.headerText = labels.insert;

            this.buttonList = [
                {
                    name: 'insert',
                    text: this.translate('Insert'),
                    style: 'primary',
                    disabled: true,
                }
            ];

            this.linkInfo = this.options.linkInfo || {};

            if (this.linkInfo.url) {
                this.enableButton('insert');
            }
        },

        afterRender: function () {
            this.$url = this.$el.find('[data-name="url"]');
            this.$text = this.$el.find('[data-name="text"]');
            this.$openInNewWindow = this.$el.find('[data-name="openInNewWindow"]');

            let linkInfo = this.linkInfo;

            this.$url.val(linkInfo.url || '');
            this.$text.val(linkInfo.text || '');

            if ('isNewWindow' in linkInfo) {
                this.$openInNewWindow.get(0).checked = !!linkInfo.isNewWindow;
            }
        },

        controlInputs: function () {
            let url = this.$url.val().trim();

            if (url) {
                this.enableButton('insert');
            } else {
                this.disableButton('insert');
            }
        },

        actionInsert: function () {
            let url = this.$url.val().trim();
            let text = this.$text.val().trim();
            let openInNewWindow = this.$openInNewWindow.get(0).checked;

            let data = {
                url: url,
                text: text || url,
                isNewWindow: openInNewWindow,
                range: this.linkInfo.range,
            };

            this.trigger('insert', data);
            this.close();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/wysiwyg/modals/insert-image', ['views/modal'], function (Dep) {

    return Dep.extend({

        className: 'dialog dialog-record',

        template: 'wysiwyg/modals/insert-image',

        events: {
            'click [data-action="insert"]': function () {
                this.actionInsert();
            },
            'input [data-name="url"]': function () {
                this.controlInsertButton();
            },
            'paste [data-name="url"]': function () {
                this.controlInsertButton();
            },
        },

        shortcutKeys: {
            'Control+Enter': function () {
                if (!this.$el.find('[data-name="insert"]').hasClass('disabled')) {
                    this.actionInsert();
                }
            },
        },

        data: function () {
            return {
                labels: this.options.labels || {},
            };
        },

        setup: function () {
            let labels = this.options.labels || {};

            this.headerText = labels.insert;

            this.buttonList = [];
        },

        afterRender: function () {
            let $files = this.$el.find('[data-name="files"]');

            $files.replaceWith(
                $files.clone()
                    .on('change', (e) => {
                      this.trigger('upload', e.target.files || e.target.value);
                      this.close();
                    })
                    .val('')
            );
        },

        controlInsertButton: function () {
            let value = this.$el.find('[data-name="url"]').val().trim();

            let $button = this.$el.find('[data-name="insert"]');

            if (value) {
                $button.removeClass('disabled').removeAttr('disabled');
            } else {
                $button.addClass('disabled').attr('disabled', 'disabled');
            }
        },

        actionInsert: function () {
            let url = this.$el.find('[data-name="url"]').val().trim();

            this.trigger('insert', url);
            this.close();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/working-time-range/fields/users', ['views/fields/link-multiple'], function (Dep) {

    return Dep.extend({

        getSelectPrimaryFilterName: function () {
            return 'active';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/working-time-range/fields/date-end', ['views/fields/date'], function (Dep) {


    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.validations.push('afterOrSame');
        },

        validateAfterOrSame: function () {
            let field = 'dateStart';

            let value = this.model.get(this.name);
            let otherValue = this.model.get(field);

            if (value && otherValue) {
                if (moment(value).unix() < moment(otherValue).unix()) {
                    let msg = this.translate('fieldShouldAfter', 'messages')
                        .replace('{field}', this.getLabelText())
                        .replace('{otherField}', this.translate(field, 'fields', this.model.entityType));

                    this.showValidationMessage(msg);

                    return true;
                }
            }

            return false;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/working-time-calendar/fields/time-ranges', ['views/fields/base'], function (Dep) {

    /**
     * @class
     * @name Class
     * @memberOf module:views/working-time-calendar/fields/time-ranges
     * @extends module:views/fields/base
     */
    return Dep.extend(/** @lends module:views/working-time-calendar/fields/time-ranges.Class# */{

        listTemplateContent: `
            <div class="item-list">
            {{#each itemDataList}}
                <span class="item" data-key="{{key}}"
                >{{{var viewKey ../this}}}</span>{{#unless isLast}} &nbsp;&middot;&nbsp; {{/unless}}
            {{/each}}
            </div>
            {{#unless itemDataList.length}}
            <span class="none-value">{{translate 'None'}}</span>
            {{/unless}}
        `,

        detailTemplateContent: `
            <div class="item-list">
            {{#each itemDataList}}
                <div class="item" data-key="{{key}}">
                    {{{var viewKey ../this}}}
                </div>
            {{/each}}
            </div>
            {{#unless itemDataList.length}}
            <span class="none-value">{{translate 'None'}}</span>
            {{/unless}}
        `,

        editTemplateContent: `
            <div class="item-list">
            {{#each itemDataList}}
                <div class="item" data-key="{{key}}">
                    {{{var viewKey ../this}}}
                </div>
            {{/each}}
            </div>
            <div class="add-item-container margin-top-sm">
                <a
                    role="button"
                    tabindex="0"
                    class="add-item"
                    title="{{translate 'Add'}}"
                ><span class="fas fa-plus"></span></a>
            </div>
        `,

        fetchEmptyAsNull: false,

        validations: ['required', 'valid'],

        events: {
            'click .add-item': function () {
                this.addItem();
            },
            'click .remove-item': function (e) {
                let key = parseInt($(e.currentTarget).attr('data-key'));

                this.removeItem(key);
            },
        },

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.itemDataList = this.itemKeyList.map((key, i) => {
                return {
                    key: key.toString(),
                    viewKey: this.composeViewKey(key),
                    isLast: i === this.itemKeyList.length - 1,
                };
            });

            return data;
        },

        prepare: function () {
            this.initItems();

            return this.createItemViews();
        },

        initItems: function () {
            this.itemKeyList = [];

            this.getItemListFromModel().forEach((item, i) => {
                this.itemKeyList.push(i);
            });
        },

        /**
         * @returns {Promise}
         */
        createItemView: function (item, key) {
            let viewName = this.isEditMode() ?
                'views/working-time-calendar/fields/time-ranges/item-edit' :
                'views/working-time-calendar/fields/time-ranges/item-detail';

            return this.createView(
                this.composeViewKey(key),
                viewName,
                {
                    value: item,
                    selector: '.item[data-key="' + key + '"]',
                    key: key,
                }
            )
            .then(view => {
                this.listenTo(view, 'change', () => {
                    this.trigger('change');
                });

                return view;
            });
        },

        /**
         * @returns {Promise}
         */
        createItemViews: function () {
            this.itemKeyList.forEach(key => {
                this.clearView(this.composeViewKey(key));
            });

            if (!this.model.has(this.name)) {
                return Promise.resolve();
            }

            let itemList = this.getItemListFromModel();

            let promiseList = [];

            this.itemKeyList.forEach((key, i) => {
                let item = itemList[i];

                let promise = this.createItemView(item, key);

                promiseList.push(promise);
            });

            return Promise.all(promiseList);
        },

        getItemView: function (key) {
            return this.getView(this.composeViewKey(key));
        },

        composeViewKey: function (key) {
            return 'item-' + key;
        },

        /**
         * @return {[string|null, string|null][]}
         */
        getItemListFromModel: function () {
            return Espo.Utils.cloneDeep(this.model.get(this.name) || []);
        },

        addItem: function () {
            let itemList = this.getItemListFromModel();

            let value = null;

            if (itemList.length) {
                value = itemList[itemList.length - 1][1];
            }

            let item = [value, null];

            itemList.push(item);

            let key = this.itemKeyList[this.itemKeyList.length - 1];

            if (typeof key === 'undefined') {
                key = 0;
            }

            key++;

            this.itemKeyList.push(key);

            this.$el.find('.item-list').append(
                $('<div>')
                    .addClass('item')
                    .attr('data-key', key)
            );

            this.createItemView(item, key)
                .then(view => view.render())
                .then(() => {
                    this.trigger('change');
                });
        },

        removeItem: function (key) {
            let index = this.itemKeyList.indexOf(key);

            if (key === -1) {
                return;
            }

            let itemList = this.getItemListFromModel();

            this.itemKeyList.splice(index, 1);
            itemList.splice(index, 1);

            this.model.set(this.name, itemList, {ui: true});

            this.clearView(this.composeViewKey(key));

            this.$el.find(`.item[data-key="${key}"`).remove();

            this.trigger('change');
        },

        fetch: function () {
            let itemList = [];

            this.itemKeyList.forEach(key => {
                itemList.push(
                    this.getItemView(key).fetch()
                );
            });

            let data = {};

            data[this.name] = Espo.Utils.cloneDeep(itemList);

            if (data[this.name].length === 0) {
                data[this.name] = null;
            }

            return data;
        },

        validateRequired: function () {
            if (!this.isRequired()) {
                return false;
            }

            if (this.getItemListFromModel().length) {
                return false;
            }

            let msg = this.translate('fieldIsRequired', 'messages')
                .replace('{field}', this.getLabelText());

            this.showValidationMessage(msg, '.add-item-container');

            return true;
        },

        validateValid: function () {
            if (!this.isRangesInvalid()) {
                return false;
            }

            let msg = this.translate('fieldInvalid', 'messages')
                .replace('{field}', this.getLabelText());

            this.showValidationMessage(msg, '.add-item-container');

            return true;
        },

        isRangesInvalid: function () {
            let itemList = this.getItemListFromModel();

            for (let i = 0; i < itemList.length; i++) {
                let item = itemList[i];

                if (this.isRangeInvalid(item[0], item[1], true)) {
                    return true;
                }

                if (i === 0) {
                    continue;
                }

                let prevItem = item[i - 1];

                if (this.isRangeInvalid(prevItem[1], item[0])) {
                    return true;
                }
            }

            return false;
        },

        /**
         * @param {string|null} from
         * @param {string|null} to
         * @param {boolean} [noEmpty]
         */
        isRangeInvalid: function (from, to, noEmpty) {
            if (from === null || to === null) {
                return true;
            }

            let fromNumber = parseFloat(from.replace(':', '.'));
            let toNumber = parseFloat(to.replace(':', '.'));

            if (noEmpty && fromNumber === toNumber) {
                return true;
            }

            return fromNumber > toNumber;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/working-time-calendar/fields/time-ranges/item-edit', ['view', 'lib!moment'], function (Dep, moment) {

    return Dep.extend({

        // language=Handlebars
        templateContent: `
            <div class="row">
                <div class="start-container col-xs-5">
                    <input
                        class="form-control"
                        type="text"
                        data-name="start"
                        value="{{start}}"
                        autocomplete="espo-start"
                        spellcheck="false"
                    >
                </div>
                <div class="start-container col-xs-1 center-align">
                    <span class="field-row-text-item">&nbsp;–&nbsp;</span>
                </div>
                <div class="end-container col-xs-5">
                    <input
                        class="form-control"
                        type="text"
                        data-name="end"
                        value="{{end}}"
                        autocomplete="espo-end"
                        spellcheck="false"
                    >
                </div>
                <div class="col-xs-1 center-align">
                    <a
                        role="button"
                        tabindex="0"
                        class="remove-item field-row-text-item"
                        data-key="{{key}}"
                        title="{{translate 'Remove'}}"
                    ><span class="fas fa-times"></span></a>
                </div>
            </div>
        `,

        timeFormatMap: {
            'HH:mm': 'H:i',
            'hh:mm A': 'h:i A',
            'hh:mm a': 'h:i a',
            'hh:mmA': 'h:iA',
            'hh:mma': 'h:ia',
        },

        minuteStep: 30,

        data: function () {
            let data = {};

            data.start = this.convertTimeToDisplay(this.value[0]);
            data.end = this.convertTimeToDisplay(this.value[1]);

            data.key = this.key;

            return data;
        },

        setup: function () {
            this.value = this.options.value || [null, null];
            this.key = this.options.key;
        },

        convertTimeToDisplay: function (value) {
            if (!value) {
                return '';
            }

            let m = moment(value, 'HH:mm');

            if (!m.isValid()) {
                return '';
            }

            return m.format(this.getDateTime().timeFormat);
        },

        convertTimeFromDisplay: function (value) {
            if (!value) {
                return null;
            }

            let m = moment(value, this.getDateTime().timeFormat);

            if (!m.isValid()) {
                return null;
            }

            return m.format('HH:mm');
        },

        afterRender: function () {
            this.$start = this.$el.find('[data-name="start"]');
            this.$end = this.$el.find('[data-name="end"]');

            this.initTimepicker(this.$start);
            this.initTimepicker(this.$end);

            this.setMinTime();

            this.$start.on('change', () => this.setMinTime());
        },

        setMinTime: function () {
            let value = this.$start.val();

            this.$end.timepicker('option', 'maxTime', this.convertTimeToDisplay('23:59'));

            if (!value) {
                this.$end.timepicker('option', 'minTime', null);

                return;
            }

            this.$end.timepicker('option', 'minTime', value);
        },

        initTimepicker: function ($el) {
            $el.timepicker({
                step: this.minuteStep,
                timeFormat: this.timeFormatMap[this.getDateTime().timeFormat],
            });

            $el.on('change', () => this.trigger('change'));

            $el.attr('autocomplete', 'espo-time-range-item');
        },

        fetch: function () {
            return [
                this.convertTimeFromDisplay(this.$start.val()),
                this.convertTimeFromDisplay(this.$end.val()),
            ];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/working-time-calendar/fields/time-ranges/item-detail', ['view', 'lib!moment'],
(Dep, /** @param {moment} */moment) => {

    /**
     * @extends module:view
     */
    class Class extends Dep
    {
        templateContent = `
            {{start}}
            &nbsp;–&nbsp;
            {{end}}
        `

        data() {
            return {
                start: this.convertTimeToDisplay(this.value[0]),
                end: this.convertTimeToDisplay(this.value[1]),
            };
        }

        setup() {
            this.value = this.options.value;
        }

        convertTimeToDisplay(value) {
            if (!value) {
                return '';
            }

            let m = moment(value, 'HH:mm');

            if (!m.isValid()) {
                return '';
            }

            return m.format(this.getDateTime().timeFormat);
        }
    }

    return Class;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/webhook/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: ['remove', 'massUpdate', 'export'],

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/webhook/fields/user', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        selectPrimaryFilterName: 'activeApi',

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/webhook/fields/event', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            var itemList = [];

            var scopeList = this.getMetadata().getScopeObjectList();

            scopeList = scopeList.sort(function (v1, v2) {
                return v1.localeCompare(v2);
            }.bind(this));

            scopeList.forEach(function (scope) {
                itemList.push(scope + '.' + 'create');
                itemList.push(scope + '.' + 'update');
                itemList.push(scope + '.' + 'delete');
            }, this);

            this.params.options = itemList;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user-security/modals/two-factor-sms',
    ['views/modal', 'model'],
    function (Dep, Model) {

    return Dep.extend({

        template: 'user-security/modals/two-factor-sms',

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': 'apply',
        },

        events: {
            'click [data-action="sendCode"]': function () {
                this.actionSendCode();
            },
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'danger',
                    hidden: true,
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerHtml = '&nbsp';

            let codeLength = this.getConfig().get('auth2FASmsCodeLength') || 7;

            let model = new Model();

            model.name = 'UserSecurity';

            model.set('phoneNumber', null);

            model.setDefs({
                fields: {
                    'code': {
                        type: 'varchar',
                        required: true,
                        maxLength: codeLength,
                    },
                    'phoneNumber': {
                        type: 'enum',
                        required: true,
                    },
                }
            });

            this.internalModel = model;

            this.wait(
                Espo.Ajax
                    .postRequest('UserSecurity/action/getTwoFactorUserSetupData', {
                        id: this.model.id,
                        password: this.model.get('password'),
                        auth2FAMethod: this.model.get('auth2FAMethod'),
                        reset: this.options.reset,
                    })
                    .then(data => {
                        this.phoneNumberList = data.phoneNumberList;

                        this.createView('record', 'views/record/edit-for-modal', {
                            scope: 'None',
                            selector: '.record',
                            model: model,
                            detailLayout: [
                                {
                                    rows: [
                                        [
                                            {
                                                name: 'phoneNumber',
                                                labelText: this.translate('phoneNumber', 'fields', 'User'),
                                            },
                                            false
                                        ],
                                        [
                                            {
                                                name: 'code',
                                                labelText: this.translate('Code', 'labels', 'User'),
                                            },
                                            false
                                        ],
                                    ]
                                }
                            ],
                        }, view => {
                            view.setFieldOptionList('phoneNumber', this.phoneNumberList);

                            if (this.phoneNumberList.length) {
                                model.set('phoneNumber', this.phoneNumberList[0]);
                            }

                            view.hideField('code');
                        });
                    })
            );
        },

        afterRender: function () {
            this.$sendCode = this.$el.find('[data-action="sendCode"]');

            this.$pInfo = this.$el.find('p.p-info');
            this.$pButton = this.$el.find('p.p-button');
            this.$pInfoAfter = this.$el.find('p.p-info-after');
        },

        actionSendCode: function () {
            this.$sendCode.attr('disabled', 'disabled').addClass('disabled');

            Espo.Ajax
                .postRequest('TwoFactorSms/action/sendCode', {
                    id: this.model.id,
                    phoneNumber: this.internalModel.get('phoneNumber'),
                })
                .then(() => {
                    this.showButton('apply');

                    this.$pInfo.addClass('hidden');
                    this.$pButton.addClass('hidden');
                    this.$pInfoAfter.removeClass('hidden');

                    this.getView('record').setFieldReadOnly('phoneNumber');
                    this.getView('record').showField('code');
                })
                .catch(() => {
                    this.$sendCode.removeAttr('disabled').removeClass('disabled');
                });
        },

        actionApply: function () {
            let data = this.getView('record').processFetch();

            if (!data) {
                return;
            }

            this.model.set('code', data.code);

            this.hideButton('apply');
            this.hideButton('cancel');

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            this.model
                .save()
                .then(() => {
                    Espo.Ui.notify(false);

                    this.trigger('done');
                })
                .catch(() => {
                    this.showButton('apply');
                    this.showButton('cancel');
                });
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user-security/modals/two-factor-email',
    ['views/modal', 'model'],
    function (Dep, Model) {

    return Dep.extend({

        template: 'user-security/modals/two-factor-email',

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': 'apply',
        },

        events: {
            'click [data-action="sendCode"]': function () {
                this.actionSendCode();
            },
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'danger',
                    hidden: true,
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerHtml = '&nbsp';

            let codeLength = this.getConfig().get('auth2FAEmailCodeLength') || 7;

            let model = new Model();
            model.entityType = model.name = 'UserSecurity';

            model.set('emailAddress', null);

            model.setDefs({
                fields: {
                    'code': {
                        type: 'varchar',
                        required: true,
                        maxLength: codeLength,
                    },
                    'emailAddress': {
                        type: 'enum',
                        required: true,
                    },
                }
            });

            this.internalModel = model;

            this.wait(
                Espo.Ajax
                    .postRequest('UserSecurity/action/getTwoFactorUserSetupData', {
                        id: this.model.id,
                        password: this.model.get('password'),
                        auth2FAMethod: this.model.get('auth2FAMethod'),
                        reset: this.options.reset,
                    })
                    .then(data => {
                        this.emailAddressList = data.emailAddressList;

                        this.createView('record', 'views/record/edit-for-modal', {
                            scope: 'None',
                            selector: '.record',
                            model: model,
                            detailLayout: [
                                {
                                    rows: [
                                        [
                                            {
                                                name: 'emailAddress',
                                                labelText: this.translate('emailAddress', 'fields', 'User'),
                                            },
                                            false
                                        ],
                                        [
                                            {
                                                name: 'code',
                                                labelText: this.translate('Code', 'labels', 'User'),
                                            },
                                            false
                                        ],
                                    ]
                                }
                            ],
                        }, view => {
                            view.setFieldOptionList('emailAddress', this.emailAddressList);

                            if (this.emailAddressList.length) {
                                model.set('emailAddress', this.emailAddressList[0]);
                            }

                            view.hideField('code');
                        });
                    })
            );
        },

        afterRender: function () {
            this.$sendCode = this.$el.find('[data-action="sendCode"]');

            this.$pInfo = this.$el.find('p.p-info');
            this.$pButton = this.$el.find('p.p-button');
            this.$pInfoAfter = this.$el.find('p.p-info-after');
        },

        actionSendCode: function () {
            this.$sendCode.attr('disabled', 'disabled').addClass('disabled');

            Espo.Ajax
                .postRequest('TwoFactorEmail/action/sendCode', {
                    id: this.model.id,
                    emailAddress: this.internalModel.get('emailAddress'),
                })
                .then(() => {
                    this.showButton('apply');

                    this.$pInfo.addClass('hidden');
                    this.$pButton.addClass('hidden');
                    this.$pInfoAfter.removeClass('hidden');

                    this.getView('record').setFieldReadOnly('emailAddress');
                    this.getView('record').showField('code');
                })
                .catch(() => {
                    this.$sendCode.removeAttr('disabled').removeClass('disabled');
                });
        },

        actionApply: function () {
            let data = this.getView('record').processFetch();

            if (!data) {
                return;
            }

            this.model.set('code', data.code);

            this.hideButton('apply');
            this.hideButton('cancel');

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            this.model
                .save()
                .then(() => {
                    Espo.Ui.notify(false);

                    this.trigger('done');
                })
                .catch(() => {
                    this.showButton('apply');
                    this.showButton('cancel');
                });
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user-security/modals/totp', ['views/modal', 'model'], function (Dep, Model) {

    let QRCode;

    return Dep.extend({

        template: 'user-security/modals/totp',

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': 'apply',
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerHtml = '&nbsp';

            var model = new Model();

            model.name = 'UserSecurity';

            this.wait(
                Espo.Ajax
                    .postRequest('UserSecurity/action/getTwoFactorUserSetupData', {
                        id: this.model.id,
                        password: this.model.get('password'),
                        auth2FAMethod: this.model.get('auth2FAMethod'),
                        reset: this.options.reset,
                    })
                    .then(data => {
                        this.label = data.label;
                        this.secret = data.auth2FATotpSecret;

                        model.set('secret', data.auth2FATotpSecret);
                    })
            );

            model.setDefs({
                fields: {
                    'code': {
                        type: 'varchar',
                        required: true,
                        maxLength: 7,
                    },
                    'secret': {
                        type: 'varchar',
                        readOnly: true,
                    },
                }
            });

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'None',
                selector: '.record',
                model: model,
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'secret',
                                    labelText: this.translate('Secret', 'labels', 'User'),
                                },
                                false
                            ],
                            [
                                {
                                    name: 'code',
                                    labelText: this.translate('Code', 'labels', 'User'),
                                },
                                false
                            ]
                        ]
                    }
                ],
            });

            Espo.loader.requirePromise('lib!qrcodejs').then(lib => {
                QRCode = lib;
            })
        },

        afterRender: function () {
            new QRCode(this.$el.find('.qrcode').get(0), {
                text: 'otpauth://totp/' + this.label + '?secret=' + this.secret,
                width: 256,
                height: 256,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H,
            });
        },

        actionApply: function () {
            var data = this.getView('record').processFetch();

            if (!data) {
                return;
            }

            this.model.set('code', data.code);

            this.hideButton('apply');
            this.hideButton('cancel');

            Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

            this.model
                .save()
                .then(() => {
                    Espo.Ui.notify(false);

                    this.trigger('done');
                })
                .catch(() => {
                    this.showButton('apply');
                    this.showButton('cancel');
                });
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/password-change-request', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'user/password-change-request',

        data: function () {
            return {
                requestId: this.options.requestId,
                notFound: this.options.notFound,
                notFoundMessage: this.notFoundMessage,
            };
        },

        events: {
            'click #btn-submit': function () {
                this.submit();
            },
        },

        setup: function () {
            let model = this.model = new Model();
            model.entityType = model.name = 'User';

            this.createView('password', 'views/user/fields/password', {
                model: model,
                mode: 'edit',
                selector: '.field[data-name="password"]',
                defs: {
                    name: 'password',
                    params: {
                        required: true,
                        maxLength: 255,
                    },
                },
                strengthParams: this.options.strengthParams,
            });

            this.createView('passwordConfirm', 'views/fields/password', {
                model: model,
                mode: 'edit',
                selector: '.field[data-name="passwordConfirm"]',
                defs: {
                    name: 'passwordConfirm',
                    params: {
                        required: true,
                        maxLength: 255,
                    },
                },
            });

            this.createView('generatePassword', 'views/user/fields/generate-password', {
                model: model,
                mode: 'detail',
                readOnly: true,
                selector: '.field[data-name="generatePassword"]',
                defs: {
                    name: 'generatePassword',
                },
                strengthParams: this.options.strengthParams,
            });

            this.createView('passwordPreview', 'views/fields/base', {
                model: model,
                mode: 'detail',
                readOnly: true,
                selector: '.field[data-name="passwordPreview"]',
                defs: {
                    name: 'passwordPreview',
                },
            });

            this.model.on('change:passwordPreview', () => this.reRender());

            let url = this.baseUrl = window.location.href.split('?')[0];

            this.notFoundMessage = this.translate('passwordChangeRequestNotFound', 'messages', 'User')
                .replace('{url}', url);
        },

        submit: function () {
            this.getView('password').fetchToModel();
            this.getView('passwordConfirm').fetchToModel();

            var notValid = this.getView('password').validate() ||
                this.getView('passwordConfirm').validate();

            var password = this.model.get('password');

            if (notValid) {
                return;
            }

            let $submit = this.$el.find('.btn-submit');

            $submit.addClass('disabled');

            Espo.Ajax
                .postRequest('User/changePasswordByRequest', {
                    requestId: this.options.requestId,
                    password: password,
                })
                .then(data => {
                    this.$el.find('.password-change').remove();

                    var url = data.url || this.baseUrl;

                    var msg = this.translate('passwordChangedByRequest', 'messages', 'User') +
                        ' <a href="' + url + '">' + this.translate('Login', 'labels', 'User') + '</a>.';

                    this.$el.find('.msg-box')
                        .removeClass('hidden')
                        .html('<span class="text-success">' + msg + '</span>');
                })
                .catch(() =>
                    $submit.removeClass('disabled')
                );
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/list', ['views/list'], function (Dep) {

    return Dep.extend({

        storeViewAfterUpdate: false,

        setup: function () {
            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/detail', ['views/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getUser().isPortal()) {
                this.rootLinkDisabled = true;
            }

            if (this.model.id === this.getUser().id || this.getUser().isAdmin()) {

                if (this.model.isRegular() || this.model.isAdmin() || this.model.isPortal()) {
                    this.addMenuItem('dropdown', {
                        name: 'preferences',
                        label: 'Preferences',
                        style: 'default',
                        action: "preferences",
                        link: '#Preferences/edit/' + this.getUser().id
                    });
                }

                if (this.model.isRegular() || this.model.isAdmin()) {
                    if (
                        (this.getAcl().check('EmailAccountScope') && this.model.id === this.getUser().id) ||
                        this.getUser().isAdmin()
                    ) {
                        this.addMenuItem('dropdown', {
                            name: 'emailAccounts',
                            label: "Email Accounts",
                            style: 'default',
                            action: "emailAccounts",
                            link: '#EmailAccount/list/userId=' +
                                this.model.id + '&userName=' + encodeURIComponent(this.model.get('name'))
                        });
                    }

                    if (this.model.id === this.getUser().id && this.getAcl().checkScope('ExternalAccount')) {
                        this.menu.buttons.push({
                            name: 'externalAccounts',
                            label: 'External Accounts',
                            style: 'default',
                            action: "externalAccounts",
                            link: '#ExternalAccount'
                        });
                    }
                }
            }

            if (this.getAcl().checkScope('Calendar') && (this.model.isRegular() || this.model.isAdmin())) {
                var showActivities = this.getAcl().checkUserPermission(this.model);

                if (!showActivities) {
                    if (this.getAcl().get('userPermission') === 'team') {
                        if (!this.model.has('teamsIds')) {
                            this.listenToOnce(this.model, 'sync', function () {
                                if (this.getAcl().checkUserPermission(this.model)) {
                                    this.showHeaderActionItem('calendar');
                                }
                            }, this);
                        }
                    }
                }

                this.menu.buttons.push({
                    name: 'calendar',
                    iconHtml: '<span class="far fa-calendar-alt"></span>',
                    text: this.translate('Calendar', 'scopeNames'),
                    style: 'default',
                    link: '#Calendar/show/userId=' +
                        this.model.id + '&userName=' + encodeURIComponent(this.model.get('name')),
                    hidden: !showActivities
                });
            }
        },

        actionPreferences: function () {
            this.getRouter().navigate('#Preferences/edit/' + this.model.id, {trigger: true});
        },

        actionEmailAccounts: function () {
            this.getRouter()
                .navigate(
                    '#EmailAccount/list/userId=' + this.model.id +
                    '&userName=' + encodeURIComponent(this.model.get('name')),
                    {trigger: true}
                );
        },

        actionExternalAccounts: function () {
            this.getRouter().navigate('#ExternalAccount', {trigger: true});
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        quickEditDisabled: true,

        rowActionsView: 'views/user/record/row-actions/default',

        massActionList: ['remove', 'massUpdate', 'export'],

        checkAllResultMassActionList: ['massUpdate', 'export'],

        setupMassActionItems: function () {
            Dep.prototype.setupMassActionItems.call(this);

            if (this.scope === 'ApiUser') {
                this.removeMassAction('massUpdate');
                this.removeMassAction('export');

                this.layoutName = 'listApi';
            }

            if (this.scope === 'PortalUser') {
                this.layoutName = 'listPortal';
            }

            if (!this.getUser().isAdmin()) {
                this.removeMassAction('massUpdate');
                this.removeMassAction('export');
            }
        },

        getModelScope: function (id) {
            var model = this.collection.get(id);

            if (model.isPortal()) {
                return 'PortalUser';
            }

            return this.scope;
        },
    });
});

define("views/user/record/edit", ["exports", "views/record/edit", "views/user/record/detail"], function (_exports, _edit, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _edit = _interopRequireDefault(_edit);
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class UserEditRecordView extends _edit.default {
    sideView = 'views/user/record/edit-side';

    /**
     * @name model
     * @type module:models/user
     * @memberOf UserEditRecordView#
     */

    setup() {
      super.setup();
      this.setupNonAdminFieldsAccess();
      if (this.model.id === this.getUser().id) {
        this.listenTo(this.model, 'after:save', () => {
          this.getUser().set(this.model.getClonedAttributes());
        });
      }
      this.hideField('sendAccessInfo');
      this.passwordInfoMessage = this.getPasswordSendingMessage();
      if (!this.passwordInfoMessage) {
        this.hideField('passwordInfo');
      }
      let passwordChanged = false;
      this.listenToOnce(this.model, 'change:password', () => {
        passwordChanged = true;
        if (this.model.isNew()) {
          this.controlSendAccessInfoFieldForNew();
          return;
        }
        this.controlSendAccessInfoField();
      });
      this.listenTo(this.model, 'change', model => {
        if (!this.model.isNew() && !passwordChanged) {
          return;
        }
        if (!model.hasChanged('emailAddress') && !model.hasChanged('portalsIds') && !model.hasChanged('password')) {
          return;
        }
        if (this.model.isNew()) {
          this.controlSendAccessInfoFieldForNew();
          return;
        }
        this.controlSendAccessInfoField();
      });
      _detail.default.prototype.setupFieldAppearance.call(this);
      this.hideField('passwordPreview');
      this.listenTo(this.model, 'change:passwordPreview', (model, value) => {
        value = value || '';
        if (value.length) {
          this.showField('passwordPreview');
        } else {
          this.hideField('passwordPreview');
        }
      });
      this.listenTo(this.model, 'after:save', () => {
        this.model.unset('password', {
          silent: true
        });
        this.model.unset('passwordConfirm', {
          silent: true
        });
      });
    }
    controlSendAccessInfoField() {
      if (this.isPasswordSendable() && this.model.get('password')) {
        this.showField('sendAccessInfo');
        return;
      }
      this.hideField('sendAccessInfo');
      this.model.set('sendAccessInfo', false);
    }
    controlSendAccessInfoFieldForNew() {
      let skipSettingTrue = this.recordHelper.getFieldStateParam('sendAccessInfo', 'hidden') === false;
      if (this.isPasswordSendable()) {
        this.showField('sendAccessInfo');
        if (!skipSettingTrue) {
          this.model.set('sendAccessInfo', true);
        }
        return;
      }
      this.hideField('sendAccessInfo');
      this.model.set('sendAccessInfo', false);
    }

    // noinspection SpellCheckingInspection
    isPasswordSendable() {
      if (this.model.isPortal()) {
        if (!(this.model.get('portalsIds') || []).length) {
          return false;
        }
      }
      if (!this.model.get('emailAddress')) {
        return false;
      }
      return true;
    }
    setupNonAdminFieldsAccess() {
      _detail.default.prototype.setupNonAdminFieldsAccess.call(this);
    }

    // noinspection JSUnusedGlobalSymbols
    controlFieldAppearance() {
      _detail.default.prototype.controlFieldAppearance.call(this);
    }
    getGridLayout(callback) {
      this.getHelper().layoutManager.get(this.model.entityType, this.options.layoutName || this.layoutName, simpleLayout => {
        let layout = Espo.Utils.cloneDeep(simpleLayout);
        layout.push({
          "label": "Teams and Access Control",
          "name": "accessControl",
          "rows": [[{
            "name": "type"
          }, {
            "name": "isActive"
          }], [{
            "name": "teams"
          }, {
            "name": "defaultTeam"
          }], [{
            "name": "roles"
          }, false]]
        });
        layout.push({
          "label": "Portal",
          "name": "portal",
          "rows": [[{
            "name": "portals"
          }, {
            "name": "contact"
          }], [{
            "name": "portalRoles"
          }, {
            "name": "accounts"
          }]]
        });
        if (this.getUser().isAdmin() && this.model.isPortal()) {
          layout.push({
            "label": "Misc",
            "name": "portalMisc",
            "rows": [[{
              "name": "dashboardTemplate"
            }, false]]
          });
        }
        if (this.model.isAdmin() || this.model.isRegular()) {
          layout.push({
            "label": "Misc",
            "name": "misc",
            "rows": [[{
              "name": "workingTimeCalendar"
            }, {
              "name": "layoutSet"
            }]]
          });
        }
        if (this.type === this.TYPE_EDIT && this.getUser().isAdmin() && !this.model.isApi()) {
          layout.push({
            label: 'Password',
            rows: [[{
              name: 'password',
              type: 'password',
              params: {
                required: false,
                readyToChange: true
              },
              view: 'views/user/fields/password'
            }, {
              name: 'generatePassword',
              view: 'views/user/fields/generate-password',
              customLabel: ''
            }], [{
              name: 'passwordConfirm',
              type: 'password',
              params: {
                required: false,
                readyToChange: true
              }
            }, {
              name: 'passwordPreview',
              view: 'views/fields/base',
              params: {
                readOnly: true
              }
            }], [{
              name: 'sendAccessInfo'
            }, {
              name: 'passwordInfo',
              type: 'text',
              customLabel: '',
              customCode: this.passwordInfoMessage
            }]]
          });
        }
        if (this.getUser().isAdmin() && this.model.isApi()) {
          layout.push({
            "name": "auth",
            "rows": [[{
              "name": "authMethod"
            }, false]]
          });
        }
        let gridLayout = {
          type: 'record',
          layout: this.convertDetailLayout(layout)
        };
        callback(gridLayout);
      });
    }
    getPasswordSendingMessage() {
      if (this.getConfig().get('outboundEmailFromAddress')) {
        return '';
      }
      let msg = this.translate('setupSmtpBefore', 'messages', 'User').replace('{url}', '#Admin/outboundEmails');
      msg = this.getHelper().transformMarkdownInlineText(msg);
      return msg;
    }
    fetch() {
      let data = super.fetch();
      if (!this.isNew) {
        if ('password' in data && (data['password'] === '' || data['password'] == null)) {
          delete data['password'];
          delete data['passwordConfirm'];
          this.model.unset('password');
          this.model.unset('passwordConfirm');
        }
      }
      return data;
    }
    exit(after) {
      if (after === 'create' || after === 'save') {
        this.model.unset('sendAccessInfo', {
          silent: true
        });
      }
      super.exit(after);
    }

    // noinspection JSUnusedGlobalSymbols
    errorHandlerUserNameExists() {
      Espo.Ui.error(this.translate('userNameExists', 'messages', 'User'));
    }
  }
  var _default = UserEditRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/edit-side', ['views/record/edit-side'], function (Dep) {

    return Dep.extend({

    });
});


/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/edit-quick', ['views/record/edit-small', 'views/user/record/detail'], function (Dep, Detail) {

    return Dep.extend({

        sideView: 'views/user/record/edit-side',

        setup: function () {
            Dep.prototype.setup.call(this);
            Detail.prototype.setupNonAdminFieldsAccess.call(this);
            Detail.prototype.setupFieldAppearance.call(this);
        },

        controlFieldAppearance: function () {
            Detail.prototype.controlFieldAppearance.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/detail-quick',
['views/record/detail-small', 'views/user/record/detail'], function (Dep, Detail) {

    return Dep.extend({

        sideView: 'views/user/record/detail-quick-side',

        bottomView: null,

        editModeEnabled: false,

        setup: function () {
            Dep.prototype.setup.call(this);
            Detail.prototype.setupNonAdminFieldsAccess.call(this);
            Detail.prototype.setupFieldAppearance.call(this);
        },

        controlFieldAppearance: function () {
            Detail.prototype.controlFieldAppearance.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/detail-quick-side',
['views/record/detail-side', 'views/user/record/detail-side'], function (Dep, UserDetailSide) {

    return Dep.extend({

        setupPanels: function () {
            UserDetailSide.prototype.setupPanels.call(this);
        },
    });
});

define("views/user/record/detail-bottom", ["exports", "views/record/detail-bottom"], function (_exports, _detailBottom) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detailBottom = _interopRequireDefault(_detailBottom);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class UserDetailBottomRecordView extends _detailBottom.default {
    setupPanels() {
      super.setupPanels();
      let streamAllowed = this.getAcl().checkUserPermission(this.model);
      if (!streamAllowed && this.getAcl().getPermissionLevel('userPermission') === 'team' && !this.model.has('teamsIds')) {
        this.listenToOnce(this.model, 'sync', () => {
          if (this.getAcl().checkUserPermission(this.model)) {
            this.onPanelsReady(() => {
              this.showPanel('stream', 'acl');
            });
          }
        });
      }
      this.panelList.push({
        "name": "stream",
        "label": "Stream",
        "view": "views/user/record/panels/stream",
        "sticked": true,
        "hidden": !streamAllowed
      });
      if (!streamAllowed) {
        this.recordHelper.setPanelStateParam('stream', 'hiddenAclLocked', true);
      }
    }
  }
  var _default = UserDetailBottomRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/row-actions/relationship-followers', ['views/record/row-actions/relationship'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                },
                link: '#' + this.model.entityType + '/view/' + this.model.id
            }];

            if (
                this.getUser().isAdmin() ||
                this.getAcl().get('followerManagementPermission') !== 'no' ||
                this.model.isPortal() && this.getAcl().get('portalPermission') === 'yes' ||
                this.model.id === this.getUser().id
            ) {
                list.push({
                    action: 'unlinkRelated',
                    label: 'Unlink',
                    data: {
                        id: this.model.id
                    }
                });
            }

            return list;
        }
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var scope = 'User';

            if (this.model.isPortal()) {
                scope = 'PortalUser';
            } else if (this.model.isApi()) {
                scope = 'ApiUser';
            }

            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id,
                    scope: scope
                },
                link: '#' + scope + '/view/' + this.model.id
            }];

            if (this.options.acl.edit) {
                list.push({
                    action: 'quickEdit',
                    label: 'Edit',
                    data: {
                        id: this.model.id,
                        scope: scope
                    },
                    link: '#' + scope + '/edit/' + this.model.id
                });
            }

            return list;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/panels/stream', ['views/stream/panel'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            let assignmentPermission = this.getAcl().checkPermission('message', this.model);

            if (this.model.id === this.getUser().id) {
                this.placeholderText = this.translate('writeMessageToSelf', 'messages');
            } else {
                this.placeholderText = this.translate('writeMessageToUser', 'messages')
                    .replace('{user}', this.model.get('name'));
            }

            if (!assignmentPermission) {
                this.postDisabled = true;

                if (this.getAcl().getPermissionLevel('message') === 'team') {
                    if (!this.model.has('teamsIds')) {
                        this.listenToOnce(this.model, 'sync', () => {
                            assignmentPermission = this.getAcl().checkUserPermission(this.model);

                            if (assignmentPermission) {
                                this.postDisabled = false;
                                this.$el.find('.post-container').removeClass('hidden');
                            }
                        });
                    }
                }
            }
        },

        prepareNoteForPost: function (model) {
            var userIdList = [this.model.id];
            var userNames = {};

            userNames[userIdList] = this.model.get('name');

            model.set('usersIds', userIdList);
            model.set('usersNames', userNames);
            model.set('targetType', 'users');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/record/panels/default-side', ['views/record/panels/default-side'], function (Dep) {

    return Dep.extend({

        complexCreatedDisabled: true,

        complexModifiedDisabled: true,

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/select-followers', ['views/modals/select-records'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.filterList = ['active'];

            if (this.getAcl().getPermissionLevel('portalPermission')) {
                this.filterList.push('activePortal');
            }

            Dep.prototype.setup.call(this);
        },
    });
});

define("views/user/modals/security", ["exports", "views/modal", "model"], function (_exports, _modal, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
  _model = _interopRequireDefault(_model);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class UserSecurityModalView extends _modal.default {
    templateContent = '<div class="record no-side-margin">{{{record}}}</div>';
    className = 'dialog dialog-record';
    shortcutKeys = {
      'Control+Enter': 'apply'
    };
    setup() {
      this.buttonList = [{
        name: 'apply',
        label: 'Apply',
        hidden: true,
        style: 'danger',
        onClick: () => this.apply()
      }, {
        name: 'cancel',
        label: 'Close'
      }];
      this.dropdownItemList = [{
        name: 'reset',
        text: this.translate('Reset 2FA'),
        hidden: true,
        onClick: () => this.reset()
      }];
      this.userModel = this.options.userModel;
      this.$header = $('<span>').append($('<span>').text(this.translate('Security')), ' <span class="chevron-right"></span> ', $('<span>').text(this.userModel.get('userName')));
      const model = this.model = new _model.default();
      model.name = 'UserSecurity';
      model.id = this.userModel.id;
      model.url = 'UserSecurity/' + this.userModel.id;
      let auth2FAMethodList = this.getConfig().get('auth2FAMethodList') || [];
      model.setDefs({
        fields: {
          'auth2FA': {
            type: 'bool',
            labelText: this.translate('auth2FAEnable', 'fields', 'User')
          },
          'auth2FAMethod': {
            type: 'enum',
            options: auth2FAMethodList,
            translation: 'Settings.options.auth2FAMethodList'
          }
        }
      });
      this.wait(model.fetch().then(() => {
        this.initialAttributes = Espo.Utils.cloneDeep(model.attributes);
        if (model.get('auth2FA')) {
          this.showActionItem('reset');
        }
        this.createView('record', 'views/record/edit-for-modal', {
          scope: 'None',
          selector: '.record',
          model: this.model,
          detailLayout: [{
            rows: [[{
              name: 'auth2FA',
              labelText: this.translate('auth2FAEnable', 'fields', 'User')
            }, {
              name: 'auth2FAMethod',
              labelText: this.translate('auth2FAMethod', 'fields', 'User')
            }]]
          }]
        }, view => {
          this.controlFieldsVisibility(view);
          this.listenTo(this.model, 'change:auth2FA', () => {
            this.controlFieldsVisibility(view);
          });
        });
      }));
      this.listenTo(this.model, 'change', () => {
        if (this.initialAttributes) {
          this.isChanged() ? this.showActionItem('apply') : this.hideActionItem('apply');
        }
      });
    }
    controlFieldsVisibility(view) {
      if (this.model.get('auth2FA')) {
        view.showField('auth2FAMethod');
        view.setFieldRequired('auth2FAMethod');
      } else {
        view.hideField('auth2FAMethod');
        view.setFieldNotRequired('auth2FAMethod');
      }
    }
    isChanged() {
      return this.initialAttributes.auth2FA !== this.model.get('auth2FA') || this.initialAttributes.auth2FAMethod !== this.model.get('auth2FAMethod');
    }
    reset() {
      this.confirm(this.translate('security2FaResetConfirmation', 'messages', 'User'), () => {
        this.apply(true);
      });
    }

    /**
     * @return {module:views/record/edit}
     */
    getRecordView() {
      return this.getView('record');
    }
    apply(reset) {
      let data = this.getRecordView().processFetch();
      if (!data) {
        return;
      }
      this.hideActionItem('apply');
      new Promise(resolve => {
        this.createView('dialog', 'views/user/modals/password', {}, passwordView => {
          passwordView.render();
          this.listenToOnce(passwordView, 'cancel', () => this.showActionItem('apply'));
          this.listenToOnce(passwordView, 'proceed', data => {
            this.model.set('password', data.password);
            passwordView.close();
            resolve();
          });
        });
      }).then(() => this.processApply(reset));
    }
    processApply(reset) {
      if (this.model.get('auth2FA')) {
        let auth2FAMethod = this.model.get('auth2FAMethod');
        const view = this.getMetadata().get(['app', 'authentication2FAMethods', auth2FAMethod, 'userApplyView']);
        if (view) {
          Espo.Ui.notify(' ... ');
          this.createView('dialog', view, {
            model: this.model,
            reset: reset
          }, view => {
            Espo.Ui.notify(false);
            view.render();
            this.listenToOnce(view, 'cancel', () => {
              this.close();
            });
            this.listenToOnce(view, 'apply', () => {
              view.close();
              this.processSave();
            });
            this.listenToOnce(view, 'done', () => {
              Espo.Ui.success(this.translate('Done'));
              this.trigger('done');
              view.close();
              this.close();
            });
          });
          return;
        }
        if (reset) {
          this.model.set('auth2FA', false);
        }
        this.processSave();
        return;
      }
      this.processSave();
    }
    processSave() {
      this.hideActionItem('apply');
      this.model.save().then(() => {
        this.close();
        Espo.Ui.success(this.translate('Done'));
      }).catch(() => this.showActionItem('apply'));
    }
  }
  var _default = UserSecurityModalView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/password', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: '<div class="record no-side-margin">{{{record}}}</div>',

        className: 'dialog dialog-record',

        shortcutKeys: {
            'Control+Enter': 'apply',
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerHtml = '&nbsp';

            this.userModel = this.options.userModel;

            var model = this.model = new Model();
            model.name = 'UserSecurity';

            model.setDefs({
                fields: {
                    'password': {
                        type: 'password',
                        required: true,
                    },
                }
            });

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'None',
                selector: '.record',
                model: this.model,
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'password',
                                    labelText: this.translate('yourPassword', 'fields', 'User'),
                                    params: {
                                        readyToChange: true,
                                    }
                                },
                                false
                            ]
                        ]
                    }
                ],
            });
        },

        actionApply: function () {
            var data = this.getView('record').processFetch();
            if (!data) return;

            this.trigger('proceed', data);
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/mass-update', ['views/modals/mass-update'], function (Dep) {

    return Dep.extend({

        setup: function () {

            if (this.options.scope === 'ApiUser') {
                this.layoutName = 'massUpdateApi';
            } else if (this.options.scope === 'PortalUser') {
                this.layoutName = 'massUpdatePortal';
            }

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/login-as', ['views/modal'], function (Dep) {

    return Dep.extend({

        backdrop: true,

        templateContent: `
            <div class="well">
                {{translate 'loginAs' category='messages' scope='User'}}
            </div>
            <a href="{{viewObject.url}}" class="text-large">{{translate 'Login Link' scope='User'}}</a>
        `,

        setup: function () {
            this.$header = $('<span>')
                .append(
                    $('<span>').text(this.model.get('name')),
                    ' ',
                    $('<span>').addClass('chevron-right'),
                    ' ',
                    $('<span>').text(this.translate('Login')),
                );

            this.url = `?entryPoint=loginAs` +
                `&anotherUser=${this.options.anotherUser}&username=${this.options.username}`;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        editDisabled: true,

        getScope: function () {
            if (this.model.isPortal()) {
                return 'PortalUser';
            }

            return 'User';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/modals/access', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'user-access',

        multiple: false,

        template: 'user/modals/access',

        backdrop: true,

        data: function () {
            return {
                valuePermissionDataList: this.getValuePermissionList(),
                levelListTranslation: this.getLanguage().get('Role', 'options', 'levelList') || {}
            };
        },

        getValuePermissionList: function () {
            var list = this.getMetadata().get(['app', 'acl', 'valuePermissionList'], []);
            var dataList = [];
            list.forEach(function (item) {
                var o = {};
                o.name = item;
                o.value = this.options.aclData[item];
                dataList.push(o);
            }, this);
            return dataList;
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'cancel',
                    label: 'Cancel'
                }
            ];

            var fieldTable = Espo.Utils.cloneDeep(this.options.aclData.fieldTable || {});

            for (var scope in fieldTable) {
                var scopeData = fieldTable[scope] || {};

                for (var field in scopeData) {
                    if (
                        this.getMetadata()
                            .get(['app', 'acl', 'mandatory', 'scopeFieldLevel', scope, field]) !== null
                    ) {
                        delete scopeData[field];
                    }

                    if (
                        scopeData[field] &&
                        this.getMetadata().get(['entityDefs', scope, 'fields', field, 'readOnly'])
                    ) {
                        if (scopeData[field].edit === 'no' && scopeData[field].read === 'yes') {
                            delete scopeData[field];
                        }
                    }
                }
            }

            this.createView('table', 'views/role/record/table', {
                acl: {
                    data: this.options.aclData.table,
                    fieldData: fieldTable,
                },
                final: true
            });

            this.headerText = this.translate('Access');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/user-name', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.validations.push('userName');
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            let userNameRegularExpression = this.getUserNameRegularExpression();

            if (this.isEditMode()) {
                this.$element.on('change', () => {
                    let value = this.$element.val();
                    let re = new RegExp(userNameRegularExpression, 'gi');

                    value = value
                        .replace(re, '')
                        .replace(/[\s]/g, '_')
                        .toLowerCase();

                    this.$element.val(value);
                    this.trigger('change');
                });
            }
        },

        getUserNameRegularExpression: function () {
            return this.getConfig().get('userNameRegularExpression') || '[^a-z0-9\-@_\.\s]';
        },

        validateUserName: function () {
            let value = this.model.get(this.name);

            if (!value) {
                return;
            }

            let userNameRegularExpression = this.getUserNameRegularExpression();

            let re = new RegExp(userNameRegularExpression, 'gi');

            if (!re.test(value)) {
                return;
            }

            let msg = this.translate('fieldInvalid', 'messages').replace('{field}', this.getLabelText());

            this.showValidationMessage(msg);

            return true;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/teams', ['views/fields/link-multiple-with-role'], function (Dep) {

    return Dep.extend({

        forceRoles: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.roleListMap = {};

            this.loadRoleList(() => {
                if (this.isEditMode()) {
                    if (this.isRendered() || this.isBeingRendered()) {
                        this.reRender();
                    }
                }
            });

            this.listenTo(this.model, 'change:teamsIds', () => {
                let toLoad = false;

                this.ids.forEach(id => {
                    if (!(id in this.roleListMap)) {
                        toLoad = true;
                    }
                });

                if (toLoad) {
                    this.loadRoleList(() => {
                        this.reRender();
                    });
                }
            });
        },

        loadRoleList: function (callback, context) {
            if (!this.getAcl().checkScope('Team', 'read')) {
                return;
            }

            let ids = this.ids || [];

            if (ids.length === 0) {
                return;
            }

            this.getCollectionFactory().create('Team', teams => {
                teams.maxSize = 50;
                teams.where = [
                    {
                        type: 'in',
                        field: 'id',
                        value: ids,
                    }
                ];

                this.listenToOnce(teams, 'sync', () => {
                    teams.models.forEach(model => {
                        this.roleListMap[model.id] = model.get('positionList') || [];
                    });

                    callback.call(context);
                });

                teams.fetch();
            });
        },

        getDetailLinkHtml: function (id, name) {
            name = name || this.nameHash[id];

            let role = (this.columns[id] || {})[this.columnName] || '';

            let $el = $('<div>')
                .append(
                    $('<a>')
                        .attr('href', '#' + this.foreignScope + '/view/' + id)
                        .attr('data-id', id)
                        .text(name)
                );

            if (role) {
                role = this.getHelper().escapeString(role);

                $el.append(
                    $('<span>').text(' '),
                    $('<span>').addClass('text-muted chevron-right'),
                    $('<span>').text(' '),
                    $('<span>').addClass('text-muted').text(role)
                )
            }

            return $el.get(0).outerHTML;
        },

        getJQSelect: function (id, roleValue) {
            /** @var {string[]} */
            let roleList = Espo.Utils.clone(this.roleListMap[id] || []);

            if (!roleList.length && !roleValue) {
                return null;
            }

            roleList.unshift('');

            if (roleValue && roleList.indexOf(roleValue) === -1) {
                roleList.push(roleValue);
            }

            let $role = $('<select>')
                .addClass('role form-control input-sm pull-right')
                .attr('data-id', id);

            roleList.forEach(role => {
                let $option = $('<option>')
                    .val(role)
                    .text(role);

                if (role === (roleValue || '')) {
                    $option.attr('selected', 'selected');
                }

                $role.append($option);
            });

            return $role;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/password', ['views/fields/password'], function (Dep) {

    return Dep.extend({

        validations: ['required', 'strength', 'confirm'],

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        init: function () {
            var tooltipItemList = [];

            this.strengthParams = this.options.strengthParams || {
                passwordStrengthLength: this.getConfig().get('passwordStrengthLength'),
                passwordStrengthLetterCount: this.getConfig().get('passwordStrengthLetterCount'),
                passwordStrengthNumberCount: this.getConfig().get('passwordStrengthNumberCount'),
                passwordStrengthBothCases: this.getConfig().get('passwordStrengthBothCases'),
            };

            var minLength = this.strengthParams.passwordStrengthLength;
            if (minLength) {
                tooltipItemList.push(
                    '* ' + this.translate('passwordStrengthLength', 'messages', 'User').replace('{length}', minLength.toString())
                );
            }

            var requiredLetterCount = this.strengthParams.passwordStrengthLetterCount;
            if (requiredLetterCount) {
                tooltipItemList.push(
                    '* ' + this.translate('passwordStrengthLetterCount', 'messages', 'User').replace('{count}', requiredLetterCount.toString())
                );
            }

            var requiredNumberCount = this.strengthParams.passwordStrengthNumberCount;
            if (requiredNumberCount) {
                tooltipItemList.push(
                    '* ' + this.translate('passwordStrengthNumberCount', 'messages', 'User').replace('{count}', requiredNumberCount.toString())
                );
            }

            var bothCases = this.strengthParams.passwordStrengthBothCases;
            if (bothCases) {
                tooltipItemList.push(
                    '* ' + this.translate('passwordStrengthBothCases', 'messages', 'User')
                );
            }

            if (tooltipItemList.length) {
                this.tooltip = true;
                this.tooltipText = this.translate('Requirements', 'labels', 'User') + ':\n' + tooltipItemList.join('\n');
            }

            Dep.prototype.init.call(this);
        },

        validateStrength: function () {
            if (!this.model.get(this.name)) return;

            var password = this.model.get(this.name);

            var minLength = this.strengthParams.passwordStrengthLength;
            if (minLength) {
                if (password.length < minLength) {
                    var msg = this.translate('passwordStrengthLength', 'messages', 'User').replace('{length}', minLength.toString());
                    this.showValidationMessage(msg);
                    return true;;
                }
            }

            var requiredLetterCount = this.strengthParams.passwordStrengthLetterCount;
            if (requiredLetterCount) {
                var letterCount = 0;
                password.split('').forEach(function (c) {
                    if (c.toLowerCase() !== c.toUpperCase()) letterCount++;
                }, this);

                if (letterCount < requiredLetterCount) {
                    var msg = this.translate('passwordStrengthLetterCount', 'messages', 'User').replace('{count}', requiredLetterCount.toString());
                    this.showValidationMessage(msg);
                    return true;;
                }
            }

            var requiredNumberCount = this.strengthParams.passwordStrengthNumberCount;
            if (requiredNumberCount) {
                var numberCount = 0;
                password.split('').forEach(function (c) {
                    if (c >= '0' && c <= '9') numberCount++;
                }, this);

                if (numberCount < requiredNumberCount) {
                    var msg = this.translate('passwordStrengthNumberCount', 'messages', 'User').replace('{count}', requiredNumberCount.toString());
                    this.showValidationMessage(msg);
                    return true;;
                }
            }

            var bothCases = this.strengthParams.passwordStrengthBothCases;
            if (bothCases) {
                var ucCount = 0;
                password.split('').forEach(function (c) {
                    if (c.toLowerCase() !== c.toUpperCase() && c === c.toUpperCase()) ucCount++;
                }, this);
                var lcCount = 0;
                password.split('').forEach(function (c) {
                    if (c.toLowerCase() !== c.toUpperCase() && c === c.toLowerCase()) lcCount++;
                }, this);

                if (!ucCount || !lcCount) {
                    var msg = this.translate('passwordStrengthBothCases', 'messages', 'User');
                    this.showValidationMessage(msg);
                    return true;
                }
            }
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/name', ['views/fields/person-name'], function (Dep) {

    return Dep.extend({

        listTemplate: 'user/fields/name/list-link',

        listLinkTemplate: 'user/fields/name/list-link',

        data: function () {
            return _.extend({
                avatar: this.getAvatarHtml(),
                frontScope: this.model.isPortal() ? 'PortalUser': 'User',
                isOwn: this.model.id === this.getUser().id,
            }, Dep.prototype.data.call(this));
        },

        getAvatarHtml: function () {
            return this.getHelper().getAvatarHtml(this.model.id, 'small', 16, 'avatar-link');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/generate-password', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        templateContent: '<button type="button" class="btn btn-default" data-action="generatePassword">' +
            '{{translate \'Generate\' scope=\'User\'}}</button>',

        events: {
            'click [data-action="generatePassword"]': function () {
                this.actionGeneratePassword();
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:password', (model, value, o) => {
                if (o.isGenerated) {
                    return;
                }

                this.model.set({
                    passwordPreview: '',
                });
            });

            this.strengthParams = this.options.strengthParams || {};

            this.passwordStrengthLength = this.strengthParams.passwordStrengthLength ||
                this.getConfig().get('passwordStrengthLength');

            this.passwordStrengthLetterCount = this.strengthParams.passwordStrengthLetterCount ||
                this.getConfig().get('passwordStrengthLetterCount');

            this.passwordStrengthNumberCount = this.strengthParams.passwordStrengthNumberCount ||
                this.getConfig().get('passwordStrengthNumberCount');

            this.passwordGenerateLength = this.strengthParams.passwordGenerateLength ||
                this.getConfig().get('passwordGenerateLength');

            this.passwordGenerateLetterCount = this.strengthParams.passwordGenerateLetterCount ||
                this.getConfig().get('passwordGenerateLetterCount');

            this.passwordGenerateNumberCount = this.strengthParams.passwordGenerateNumberCount ||
                this.getConfig().get('passwordGenerateNumberCount');
        },

        fetch: function () {
            return {};
        },

        actionGeneratePassword: function () {
            var length = this.passwordStrengthLength;
            var letterCount = this.passwordStrengthLetterCount;
            var numberCount = this.passwordStrengthNumberCount;

            var generateLength = this.passwordGenerateLength || 10;
            var generateLetterCount = this.passwordGenerateLetterCount || 4;
            var generateNumberCount = this.passwordGenerateNumberCount || 2;

            length = (typeof length === 'undefined') ? generateLength : length;
            letterCount = (typeof letterCount === 'undefined') ? generateLetterCount : letterCount;
            numberCount = (typeof numberCount === 'undefined') ? generateNumberCount : numberCount;

            if (length < generateLength) length = generateLength;
            if (letterCount < generateLetterCount) letterCount = generateLetterCount;
            if (numberCount < generateNumberCount) numberCount = generateNumberCount;

            var password = this.generatePassword(length, letterCount, numberCount, true);

            this.model.set({
                password: password,
                passwordConfirm: password,
                passwordPreview: password,
            }, {isGenerated: true});
        },

        generatePassword: function (length, letters, numbers, bothCases) {
            var chars = [
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                '0123456789',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                'abcdefghijklmnopqrstuvwxyz',
            ];

            var upperCase = 0;
            var lowerCase = 0;

            if (bothCases) {
                upperCase = 1;
                lowerCase = 1;

                if (letters >= 2) {
                    letters = letters - 2;
                } else {
                    letters = 0;
                }
            }

            var either = length - (letters + numbers + upperCase + lowerCase);

            if (either < 0) {
                either = 0;
            }

            var setList = [letters, numbers, either, upperCase, lowerCase];

            var shuffle = function (array) {
                var currentIndex = array.length, temporaryValue, randomIndex;

                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
            };

            var array = setList.map(
                function (len, i) {
                    return Array(len).fill(chars[i]).map(
                        function (x) {
                            return x[Math.floor(Math.random() * x.length)];
                        }
                    ).join('');
                }
            ).concat();

            return shuffle(array).join('');
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/contact', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        select: function (model) {
            Dep.prototype.select.call(this, model);

            var attributes = {};

            if (model.get('accountId')) {
                var names = {};

                names[model.get('accountId')] = model.get('accountName');
                attributes.accountsIds = [model.get('accountId')];
                attributes.accountsNames = names;
            }

            attributes.firstName = model.get('firstName');
            attributes.lastName = model.get('lastName');
            attributes.salutationName = model.get('salutationName');

            attributes.emailAddress = model.get('emailAddress');
            attributes.emailAddressData = model.get('emailAddressData');

            attributes.phoneNumber = model.get('phoneNumber');
            attributes.phoneNumberData = model.get('phoneNumberData');

            if (this.model.isNew() && !this.model.get('userName') && attributes.emailAddress) {
                attributes.userName = attributes.emailAddress;
            }

            this.model.set(attributes);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/user/fields/avatar', ['views/fields/image'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('after:inline-save', () => {
                this.suspendCache = true;

                this.reRender();
            });
        },

        handleUploadingFile: function (file) {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();

                fileReader.onload = (e) => {
                    this.createView('crop', 'views/modals/image-crop', {contents: e.target.result})
                        .then(view => {
                            view.render();

                            let cropped = false;

                            this.listenToOnce(view, 'crop', (dataUrl) => {
                                cropped = true;

                                setTimeout(() => {
                                    fetch(dataUrl)
                                        .then(result => result.blob())
                                        .then(blob => {
                                            resolve(
                                                new File([blob], 'avatar.jpg', {type: 'image/jpeg'})
                                            );
                                        });
                                }, 10);
                            });

                            this.listenToOnce(view, 'remove', () => {
                                if (!cropped) {
                                    setTimeout(() => this.render(), 10);

                                    reject();
                                }

                                this.clearView('crop');
                            });
                        });
                };

                fileReader.readAsDataURL(file);
            });
        },

        getValueForDisplay: function () {
            if (!this.isReadMode()) {
                return '';
            }

            let id = this.model.get(this.idName);
            let userId = this.model.id;

            let t = this.cacheTimestamp = this.cacheTimestamp || Date.now();

            if (this.suspendCache) {
                t = Date.now();
            }

            let src = this.getBasePath() +
                '?entryPoint=avatar&size=' + this.previewSize + '&id=' + userId +
                '&t=' + t + '&attachmentId=' + (id || 'false');

            let $img = $('<img>')
                .attr('src', src)
                .css({
                    maxWidth: (this.imageSizes[this.previewSize] || {})[0],
                    maxHeight: (this.imageSizes[this.previewSize] || {})[1],
                });

            if (!this.isDetailMode()) {
                if (this.getCache()) {
                    t = this.getCache().get('app', 'timestamp');
                }

                let src = this.getBasePath() + '?entryPoint=avatar&size=' +
                    this.previewSize + '&id=' + userId + '&t=' + t;

                $img
                    .attr('width', '16')
                    .attr('src', src)
                    .css('maxWidth', '16px');
            }

            if (!id) {
                return $img
                    .get(0)
                    .outerHTML;
            }

            return $('<a>')
                .attr('data-id', id)
                .attr('data-action', 'showImagePreview')
                .attr('href', this.getBasePath() + '?entryPoint=image&id=' + id)
                .append($img)
                .get(0)
                .outerHTML;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/auto-follow-entity-type-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.params.options = Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    return this.getMetadata().get('scopes.' + scope + '.entity') &&
                        this.getMetadata().get('scopes.' + scope + '.stream');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/template/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            if (!this.model.isNew()) {
                this.setFieldReadOnly('entityType');
            }

            if (this.model.get('entityType')) {
                this.showField('variables');
            }
            else {
                this.hideField('variables');
            }

            if (this.model.isNew()) {
                var storedData = {};

                this.listenTo(this.model, 'change:entityType', function (model) {
                    var entityType = this.model.get('entityType');

                    if (!entityType) {
                        this.model.set('header', '');
                        this.model.set('body', '');
                        this.model.set('footer', '');

                        this.hideField('variables');

                        return;
                    }
                    this.showField('variables');

                    if (entityType in storedData) {
                        this.model.set('header', storedData[entityType].header);
                        this.model.set('body', storedData[entityType].body);
                        this.model.set('footer', storedData[entityType].footer);

                        return;
                    }

                    var header, body, footer;

                    var sourceType = null;

                    if (
                        this.getMetadata().get(['entityDefs', 'Template', 'defaultTemplates', entityType])
                    ) {
                        var sourceType = entityType;
                    }
                    else {
                        var scopeType = this.getMetadata().get(['scopes', entityType, 'type']);

                        if (
                            scopeType &&
                            this.getMetadata().get(['entityDefs', 'Template', 'defaultTemplates', scopeType])
                        ) {

                            var sourceType = scopeType;
                        }
                    }

                    if (sourceType) {
                        header = this.getMetadata().get(
                            ['entityDefs', 'Template', 'defaultTemplates', sourceType, 'header']
                        );

                        body = this.getMetadata().get(
                            ['entityDefs', 'Template', 'defaultTemplates', sourceType, 'body']
                        );

                        footer = this.getMetadata().get(
                            ['entityDefs', 'Template', 'defaultTemplates', sourceType, 'footer']
                        );
                    }

                    body = body || '';
                    header = header || null;
                    footer = footer || null;

                    this.model.set('body', body);
                    this.model.set('header', header);
                    this.model.set('footer', footer);
                }, this);

                this.listenTo(this.model, 'change', function (e, o) {
                    if (!o.ui) {
                        return;
                    }

                    if (
                        !this.model.hasChanged('header') &&
                        !this.model.hasChanged('body') &&
                        !this.model.hasChanged('footer')
                    ) {
                        return;
                    }

                    var entityType = this.model.get('entityType');

                    if (!entityType) {
                        return;
                    }

                    storedData[entityType] = {
                        header: this.model.get('header'),
                        body: this.model.get('body'),
                        footer: this.model.get('footer'),
                    };
                }, this);
            }
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/template/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.hideField('variables');

            this.on('after:set-edit-mode', function () {
                this.showField('variables');
            }, this);

            this.on('after:set-detail-mode', function () {
                this.hideField('variables');
            }, this);
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/template/fields/variables', ['views/fields/base', 'ui/select'],
function (Dep, /** module:ui/select */Select) {

    return Dep.extend({

        inlineEditDisabled: true,

        detailTemplate: 'template/fields/variables/detail',
        editTemplate: 'template/fields/variables/edit',

        data: function () {
            return {
                attributeList: this.attributeList,
                entityType: this.model.get('entityType'),
                translatedOptions: this.translatedOptions
            };
        },

        events: {
            'change [data-name="variables"]': function () {
                var attribute = this.$el.find('[data-name="variables"]').val();

                var $copy = this.$el.find('[data-name="copy"]');

                if (attribute !== '') {
                    if (this.textVariables[attribute]) {
                        $copy.val('{{{' + attribute + '}}}');
                    } else {
                        $copy.val('{{' + attribute + '}}');
                    }
                } else {
                    $copy.val('');
                }
            }
        },

        setup: function () {
            this.setupAttributeList();
            this.setupTranslatedOptions();

            this.listenTo(this.model, 'change:entityType', () => {
                this.setupAttributeList();
                this.setupTranslatedOptions();
                this.reRender();
            });
        },

        setupAttributeList: function () {
            this.translatedOptions = {};

            var entityType = this.model.get('entityType');

            var fieldList = this.getFieldManager().getEntityTypeFieldList(entityType);

            var ignoreFieldList = [];

            fieldList.forEach(field => {
                let aclDefs = this.getMetadata().get(['entityAcl', entityType, 'fields', field]) || {};
                let fieldDefs = this.getMetadata().get(['entityDefs', entityType, 'fields', field]) || {};

                if (
                    aclDefs.onlyAdmin ||
                    aclDefs.forbidden ||
                    aclDefs.internal ||
                    fieldDefs.disabled ||
                    fieldDefs.utility ||
                    fieldDefs.directAccessDisabled ||
                    fieldDefs.templatePlaceholderDisabled
                ) {
                    ignoreFieldList.push(field);
                }
            });

            var attributeList = this.getFieldManager().getEntityTypeAttributeList(entityType) || [];

            var forbiddenList = Espo.Utils.clone(this.getAcl().getScopeForbiddenAttributeList(entityType));

            ignoreFieldList.forEach((field) => {
                this.getFieldManager().getEntityTypeFieldAttributeList(entityType, field).forEach(function (attribute) {
                    forbiddenList.push(attribute);
                });
            });

            attributeList = attributeList.filter((item) => {
                if (~forbiddenList.indexOf(item)) return;

                var fieldType = this.getMetadata().get(['entityDefs', entityType, 'fields', item, 'type']);

                if (fieldType === 'map') {
                    return;
                }

                return true;
            });


            attributeList.push('id');

            if (this.getMetadata().get('entityDefs.' + entityType + '.fields.name.type') === 'personName') {
                if (!~attributeList.indexOf('name')) {
                    attributeList.unshift('name');
                }
            }

            this.addAdditionalPlaceholders(entityType, attributeList);

            attributeList = attributeList.sort((v1, v2) => {
                return this.translate(v1, 'fields', entityType).localeCompare(this.translate(v2, 'fields', entityType));
            });

            this.attributeList = attributeList;

            this.textVariables = {};

            this.attributeList.forEach((item) => {
                if (
                    ~['text', 'wysiwyg']
                        .indexOf(this.getMetadata().get(['entityDefs', entityType, 'fields', item, 'type']))
                ) {
                    this.textVariables[item] = true;
                }
            });

            if (!~this.attributeList.indexOf('now')) {
                this.attributeList.unshift('now');
            }

            if (!~this.attributeList.indexOf('today')) {
                this.attributeList.unshift('today');
            }

            attributeList.unshift('pagebreak');

            this.attributeList.unshift('');

            var links = this.getMetadata().get('entityDefs.' + entityType + '.links') || {};

            var linkList = Object.keys(links).sort((v1, v2) => {
                return this.translate(v1, 'links', entityType).localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach((link) => {
                var type = links[link].type;

                if (type !== 'belongsTo') {
                    return;
                }

                var scope = links[link].entity;
                if (!scope) return;

                if (links[link].disabled || links[link].utility) {
                    return;
                }

                if (
                    this.getMetadata().get(['entityAcl', entityType, 'links', link, 'onlyAdmin'])
                    ||
                    this.getMetadata().get(['entityAcl', entityType, 'links', link, 'forbidden'])
                    ||
                    this.getMetadata().get(['entityAcl', entityType, 'links', link, 'internal'])
                ) {
                    return;
                }

                var fieldList = this.getFieldManager().getEntityTypeFieldList(scope);

                var ignoreFieldList = [];

                fieldList.forEach(field => {
                    let aclDefs = this.getMetadata().get(['entityAcl', entityType, 'fields', field]) || {};
                    let fieldDefs = this.getMetadata().get(['entityDefs', entityType, 'fields', field]) || {};

                    if (
                        aclDefs.onlyAdmin ||
                        aclDefs.forbidden ||
                        aclDefs.internal ||
                        fieldDefs.disabled ||
                        fieldDefs.utility ||
                        fieldDefs.directAccessDisabled ||
                        fieldDefs.templatePlaceholderDisabled
                    ) {
                        ignoreFieldList.push(field);
                    }
                });

                var attributeList = this.getFieldManager().getEntityTypeAttributeList(scope) || [];

                var forbiddenList = Espo.Utils.clone(this.getAcl().getScopeForbiddenAttributeList(scope));

                ignoreFieldList.forEach((field) => {
                    this.getFieldManager().getEntityTypeFieldAttributeList(scope, field).forEach((attribute) => {
                        forbiddenList.push(attribute);
                    });
                });

                attributeList = attributeList.filter((item) => {
                    if (~forbiddenList.indexOf(item)) {
                        return;
                    }

                    var fieldType = this.getMetadata().get(['entityDefs', scope, 'fields', item, 'type']);

                    if (fieldType === 'map') {
                        return;
                    }

                    return true;
                });

                attributeList.push('id');

                if (this.getMetadata().get('entityDefs.' + scope + '.fields.name.type') === 'personName') {
                    attributeList.unshift('name');
                }

                var originalAttributeList = Espo.Utils.clone(attributeList);

                this.addAdditionalPlaceholders(scope, attributeList, link, entityType);

                attributeList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
                });

                attributeList.forEach((item) => {
                    if (~originalAttributeList.indexOf(item)) {
                        this.attributeList.push(link + '.' + item);
                    } else {
                        this.attributeList.push(item);
                    }
                });

                attributeList.forEach((item) => {
                    var variable = link + '.' + item;

                    if (
                        ~['text', 'wysiwyg']
                            .indexOf(this.getMetadata().get(['entityDefs', scope, 'fields', item, 'type']))
                    ) {
                        this.textVariables[variable] = true;
                    }
                });
            });

            return this.attributeList;
        },

        addAdditionalPlaceholders: function (entityType, attributeList, link, superEntityType) {
            function removeItem(attributeList, item) {
                for (var i = 0; i < attributeList.length; i++) {
                    if (attributeList[i] === item) {
                        attributeList.splice(i, 1);
                    }
                }
            }

            var fieldDefs = this.getMetadata().get(['entityDefs', entityType, 'fields']) || {};

            for (var field in fieldDefs) {
                var fieldType = fieldDefs[field].type;

                var item = field;
                if (link) item = link + '.' + item;

                var cAttributeList = Espo.Utils.clone(attributeList);

                if (fieldType === 'image') {
                    removeItem(attributeList, field + 'Name');
                    removeItem(attributeList, field + 'Id');

                    var value = 'imageTag '+item+'Id';
                    attributeList.push(value);

                    this.translatedOptions[value] = this.translate(field, 'fields', entityType);
                    if (link) {
                        this.translatedOptions[value] = this.translate(link, 'links', superEntityType) + '.' +
                            this.translatedOptions[value];
                    }
                } else if (fieldType === 'barcode') {
                    removeItem(attributeList, field);

                    var barcodeType = this.getMetadata().get(['entityDefs', entityType, 'fields', field, 'codeType']);
                    var value = "barcodeImage "+item+" type='"+barcodeType+"'";

                    attributeList.push(value);

                    this.translatedOptions[value] = this.translate(field, 'fields', entityType);
                    if (link) {
                        this.translatedOptions[value] = this.translate(link, 'links', superEntityType) + '.' +
                            this.translatedOptions[value];
                    }
                }
            }
        },

        setupTranslatedOptions: function () {
            var entityType = this.model.get('entityType');

            this.attributeList.forEach((item) => {
                if (~['today', 'now', 'pagebreak'].indexOf(item)) {
                    if (!this.getMetadata().get(['entityDefs', entityType, 'fields', item])) {
                        this.translatedOptions[item] = this.getLanguage()
                            .translateOption(item, 'placeholders', 'Template');

                        return;
                    }
                }

                var field = item;
                var scope = entityType;
                var isForeign = false;

                if (~item.indexOf('.')) {
                    isForeign = true;
                    field = item.split('.')[1];
                    var link = item.split('.')[0];
                    scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
                }

                if (this.translatedOptions[item]) {
                    return;
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                if (field.indexOf('Id') === field.length - 2) {
                    var baseField = field.substr(0, field.length - 2);

                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('id', 'fields') + ')';
                    }
                }
                else if (field.indexOf('Name') === field.length - 4) {
                    var baseField = field.substr(0, field.length - 4);

                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('name', 'fields') + ')';
                    }
                }
                else if (field.indexOf('Type') === field.length - 4) {
                    var baseField = field.substr(0, field.length - 4);

                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('type', 'fields') + ')';
                    }
                }

                if (field.indexOf('Ids') === field.length - 3) {
                    var baseField = field.substr(0, field.length - 3);

                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('ids', 'fields') + ')';
                    }
                }
                else if (field.indexOf('Names') === field.length - 5) {
                    var baseField = field.substr(0, field.length - 5);
                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('names', 'fields') + ')';
                    }
                }
                else if (field.indexOf('Types') === field.length - 5) {
                    var baseField = field.substr(0, field.length - 5);

                    if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                        this.translatedOptions[item] = this.translate(baseField, 'fields', scope) +
                            ' (' + this.translate('types', 'fields') + ')';
                    }
                }

                if (isForeign) {
                    this.translatedOptions[item] =  this.translate(link, 'links', entityType) + '.' +
                        this.translatedOptions[item];
                }
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === this.MODE_EDIT) {
                Select.init(this.$el.find('[data-name="variables"]'));
            }
        },

        fetch: function () {},

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/template/fields/font-face', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            var engine = this.getConfig().get('pdfEngine') || 'Dompdf';

            var fontFaceList = this.getMetadata().get([
                'app', 'pdfEngines', engine, 'fontFaceList',
            ]) || [];

            fontFaceList = Espo.Utils.clone(fontFaceList);

            fontFaceList.unshift('');

            this.params.options = fontFaceList;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/template/fields/entity-type', ['views/fields/entity-type'], function (Dep) {

    return Dep.extend({

        checkAvailability: function (entityType) {
            var defs = this.scopesMetadataDefs[entityType] || {};

            if (defs.pdfTemplate) {
                return true;
            }

            if (defs.entity && defs.object) {
                return true;
            }
        },
    });
});

define("views/template/fields/body", ["exports", "views/fields/wysiwyg"], function (_exports, _wysiwyg) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _wysiwyg = _interopRequireDefault(_wysiwyg);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class BodyTemplateFieldView extends _wysiwyg.default {
    htmlPurificationForEditDisabled = true;
    noStylesheet = true;
    useIframe = true;
    tableClassName = '';
    tableBorderWidth = 1;
    tableCellPadding = 2;
  }
  var _default = BodyTemplateFieldView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/team/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    	quickDetailDisabled: true,

        quickEditDisabled: true,

        massActionList: ['remove'],

        checkAllResultDisabled: true,

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/team/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/team/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/team/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        editDisabled: true,

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/site-portal/navbar', ['views/site/navbar'], function (Dep) {

    return Dep.extend({

        getLogoSrc: function () {
            var companyLogoId = this.getConfig().get('companyLogoId');
            if (!companyLogoId) {
                return this.getBasePath() + (this.getThemeManager().getParam('logo') || 'client/img/logo.svg');
            }
            return this.getBasePath() + '?entryPoint=LogoImage&id='+companyLogoId+'&t=' + companyLogoId;
        },

        getTabList: function () {
            var tabList = this.getConfig().get('tabList') || [];
            tabList = Espo.Utils.clone(tabList || []);

            if (this.getThemeManager().getParam('navbarIsVertical') || tabList.length) {
                tabList.unshift('Home');
            }
            return tabList;
        },

        getQuickCreateList: function () {
            return this.getConfig().get('quickCreateList') || []
        }

    });

});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/site-portal/master', ['views/site/master'], function (Dep) {

    return Dep.extend({

        template: 'site/master',

        views: {
            header: {
                id: 'header',
                view: 'views/site-portal/header'
            },
            main: {
                id: 'main',
                view: false,
            },
            footer: {
                fullSelector: 'body > footer',
                view: 'views/site/footer'
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.$el.find('#main').addClass('main-portal');
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/site-portal/header', ['views/site/header'], function (Dep) {

    return Dep.extend({

        template: 'site/header',

        navbarView: 'views/site-portal/navbar',

        customViewPath: ['clientDefs', 'App', 'portalNavbarView'],

    });
});

define("views/site/navbar/quick-create", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class QuickCreateNavbarView extends _view.default {
    templateContent = `
        <a
            id="nav-quick-create-dropdown"
            class="dropdown-toggle"
            data-toggle="dropdown"
            role="button"
            tabindex="0"
            title="{{translate 'Create'}}"
        ><i class="fas fa-plus icon"></i></a>
        <ul class="dropdown-menu" role="menu" aria-labelledby="nav-quick-create-dropdown">
            <li class="dropdown-header">{{translate 'Create'}}</li>
            {{#each list}}
                <li><a
                    href="#{{./this}}/create"
                    data-name="{{./this}}"
                    data-action="quickCreate"
                >{{translate this category='scopeNames'}}</a></li>
            {{/each}}
        </ul>
    `;
    data() {
      return {
        list: this.list
      };
    }
    setup() {
      this.addActionHandler('quickCreate', (e, element) => {
        e.preventDefault();
        this.processCreate(element.dataset.name);
      });
      const scopes = this.getMetadata().get('scopes') || {};

      /** @type {string[]} */
      const list = this.getConfig().get('quickCreateList') || [];
      this.list = list.filter(scope => {
        if (!scopes[scope]) {
          return false;
        }
        if ((scopes[scope] || {}).disabled) {
          return;
        }
        if ((scopes[scope] || {}).acl) {
          return this.getAcl().check(scope, 'create');
        }
        return true;
      });
    }
    isAvailable() {
      return this.list.length > 0;
    }
    processCreate(scope) {
      Espo.Ui.notify(' ... ');
      const type = this.getMetadata().get(['clientDefs', scope, 'quickCreateModalType']) || 'edit';
      const viewName = this.getMetadata().get(['clientDefs', scope, 'modalViews', type]) || 'views/modals/edit';
      this.createView('dialog', viewName, {
        scope: scope
      }).then(view => view.render()).then(() => Espo.Ui.notify(false));
    }
  }
  var _default = QuickCreateNavbarView;
  _exports.default = _default;
});

define("views/settings/modals/tab-list-field-add", ["exports", "views/modals/array-field-add"], function (_exports, _arrayFieldAdd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _arrayFieldAdd = _interopRequireDefault(_arrayFieldAdd);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class TabListFieldAddSettingsModalView extends _arrayFieldAdd.default {
    setup() {
      super.setup();
      if (!this.options.noGroups) {
        this.buttonList.push({
          name: 'addGroup',
          text: this.translate('Group Tab', 'labels', 'Settings')
        });
      }
      this.buttonList.push({
        name: 'addDivider',
        text: this.translate('Divider', 'labels', 'Settings')
      });
    }
    actionAddGroup() {
      this.trigger('add', {
        type: 'group',
        text: this.translate('Group Tab', 'labels', 'Settings'),
        iconClass: null,
        color: null
      });
    }
    actionAddDivider() {
      this.trigger('add', {
        type: 'divider',
        text: null
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = TabListFieldAddSettingsModalView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/modals/edit-tab-group', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        className: 'dialog dialog-record',

        templateContent: '<div class="record no-side-margin">{{{record}}}</div>',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.headerText = this.translate('Group Tab', 'labels', 'Settings');

            this.buttonList.push({
                name: 'apply',
                label: 'Apply',
                style: 'danger',
            });

            this.buttonList.push({
                name: 'cancel',
                label: 'Cancel',
            });

            this.shortcutKeys = {
                'Control+Enter': () => this.actionApply(),
            };

            var detailLayout = [
                {
                    rows: [
                        [
                            {
                                name: 'text',
                                labelText: this.translate('label', 'fields', 'Admin'),
                            },
                            {
                                name: 'iconClass',
                                labelText: this.translate('iconClass', 'fields', 'EntityManager'),
                            },
                            {
                                name: 'color',
                                labelText: this.translate('color', 'fields', 'EntityManager'),
                            },
                        ],
                        [
                            {
                                name: 'itemList',
                                labelText: this.translate('tabList', 'fields', 'Settings'),
                            },
                            false
                        ]
                    ]
                }
            ];

            var model = this.model = new Model();

            model.name = 'GroupTab';

            model.set(this.options.itemData);

            model.setDefs({
                fields: {
                    text: {
                        type: 'varchar',
                    },
                    iconClass: {
                        type: 'base',
                        view: 'views/admin/entity-manager/fields/icon-class',
                    },
                    color: {
                        type: 'base',
                        view: 'views/fields/colorpicker',
                    },
                    itemList: {
                        type: 'array',
                        view: 'views/settings/fields/group-tab-list',
                    },
                },
            });

            this.createView('record', 'views/record/edit-for-modal', {
                detailLayout: detailLayout,
                model: model,
                selector: '.record',
            });
        },

        actionApply: function () {
            var recordView = this.getView('record');

            if (recordView.validate()) {
                return;
            }

            var data = recordView.fetch();

            this.trigger('apply', data);
        },

    });
});

define("views/settings/modals/edit-tab-divider", ["exports", "views/modal", "model"], function (_exports, _modal, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
  _model = _interopRequireDefault(_model);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EditTabDividerSettingsModalView extends _modal.default {
    className = 'dialog dialog-record';
    templateContent = '<div class="record no-side-margin">{{{record}}}</div>';
    setup() {
      super.setup();
      this.headerText = this.translate('Divider', 'labels', 'Settings');
      this.buttonList.push({
        name: 'apply',
        label: 'Apply',
        style: 'danger'
      });
      this.buttonList.push({
        name: 'cancel',
        label: 'Cancel'
      });
      this.shortcutKeys = {
        'Control+Enter': () => this.actionApply()
      };
      let detailLayout = [{
        rows: [[{
          name: 'text',
          labelText: this.translate('label', 'fields', 'Admin')
        }, false]]
      }];
      let model = this.model = new _model.default({}, {
        entityType: 'Dummy'
      });
      model.set(this.options.itemData);
      model.setDefs({
        fields: {
          text: {
            type: 'varchar'
          }
        }
      });
      this.createView('record', 'views/record/edit-for-modal', {
        detailLayout: detailLayout,
        model: model,
        selector: '.record'
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionApply() {
      let recordView = /** @type {module:views/record/edit}*/this.getView('record');
      if (recordView.validate()) {
        return;
      }
      let data = recordView.fetch();
      this.trigger('apply', data);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = EditTabDividerSettingsModalView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/time-format', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = this.getMetadata().get(['app', 'dateTime', 'timeFormatList']) || [];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/thousand-separator', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        validations: ['required', 'thousandSeparator'],

        validateThousandSeparator: function () {
            if (this.model.get('thousandSeparator') === this.model.get('decimalMark')) {
                var msg = this.translate('thousandSeparatorEqualsDecimalMark', 'messages', 'Admin');

                this.showValidationMessage(msg);

                return true;
            }
        },

        fetch: function () {
            var data = {};
            var value = this.$element.val();

            data[this.name] = value || '';

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/stream-email-notifications-entity-list',
['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {

            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(function (scope) {
                if (this.getMetadata().get('scopes.' + scope + '.disabled')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.object')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.stream')) return;

                return true;
            }, this)
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/sms-provider', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        fetchEmptyValueAsNull: true,

        setupOptions: function () {
            this.params.options = Object.keys(
                this.getMetadata().get(['app', 'smsProviders']) || {}
            );

            this.params.options.unshift('');
        },
    });
});

define("views/settings/fields/phone-number-preferred-country-list", ["exports", "views/fields/multi-enum", "intl-tel-input-globals"], function (_exports, _multiEnum, _intlTelInputGlobals) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _multiEnum = _interopRequireDefault(_multiEnum);
  _intlTelInputGlobals = _interopRequireDefault(_intlTelInputGlobals);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  // noinspection NpmUsedModulesInstalled

  class SettingsPhoneNumberPreferredCountryListFieldView extends _multiEnum.default {
    setupOptions() {
      try {
        const dataList = _intlTelInputGlobals.default.getCountryData();
        this.params.options = dataList.map(item => item.iso2);
        this.translatedOptions = dataList.reduce((map, item) => {
          map[item.iso2] = `${item.iso2.toUpperCase()} +${item.dialCode}`;
          return map;
        }, {});
      } catch (e) {
        console.error(e);
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = SettingsPhoneNumberPreferredCountryListFieldView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/pdf-engine', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Object.keys(this.getMetadata().get(['app', 'pdfEngines']));

            if (this.params.options.length === 0) {
                this.params.options = [''];
            }
        },
    });
});

define("views/settings/fields/outbound-email-from-address", ["exports", "views/fields/email-address"], function (_exports, _emailAddress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _emailAddress = _interopRequireDefault(_emailAddress);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class SettingsOutboundEmailFromAddressFieldView extends _emailAddress.default {
    useAutocompleteUrl = true;
    getAutocompleteUrl(q) {
      return 'InboundEmail?searchParams=' + JSON.stringify({
        select: ['emailAddress'],
        maxSize: 7,
        where: [{
          type: 'startsWith',
          attribute: 'emailAddress',
          value: q
        }, {
          type: 'isTrue',
          attribute: 'useSmtp'
        }]
      });
    }
    transformAutocompleteResult(response) {
      const result = super.transformAutocompleteResult(response);
      result.suggestions.forEach(item => {
        item.value = item.attributes.emailAddress;
      });
      return result;
    }
  }
  var _default = SettingsOutboundEmailFromAddressFieldView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/oidc-teams', ['views/fields/link-multiple-with-role'], function (Dep) {

    return Dep.extend({

        forceRoles: true,

        roleType: 'varchar',

        columnName: 'group',

        roleMaxLength: 255,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.rolePlaceholderText = this.translate('IdP Group', 'labels', 'Settings');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/oidc-redirect-uri', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        detailTemplateContent: `
            {{#if isNotEmpty}}
                <a
                    role="button"
                    data-action="copyToClipboard"
                    class="pull-right text-soft"
                    title="{{translate 'Copy to Clipboard'}}"
                ><span class="far fa-copy"></span></a>
                {{value}}
            {{else}}
                <span class="none-value">{{translate 'None'}}</span>
            {{/if}}
        `,

        portalCollection: null,

        data: function () {
            const isNotEmpty = this.model.entityType !== 'AuthenticationProvider' ||
                this.portalCollection;

            return {
                value: this.getValueForDisplay(),
                isNotEmpty: isNotEmpty,
            };
        },

        /**
         * @protected
         */
        copyToClipboard: function () {
            const value = this.getValueForDisplay();

            navigator.clipboard.writeText(value).then(() => {
                Espo.Ui.success(this.translate('Copied to clipboard'));
            });
        },

        getValueForDisplay: function () {
            if (this.model.entityType === 'AuthenticationProvider') {
                if (!this.portalCollection) {
                    return null;
                }

                return this.portalCollection.models
                    .map(model => {
                        const file = 'oauth-callback.php'
                        const url = (model.get('url') || '').replace(/\/+$/, '') + `/${file}`;

                        const checkPart = `/portal/${model.id}/${file}`;

                        if (!url.endsWith(checkPart)) {
                            return url;
                        }

                        return url.slice(0, - checkPart.length) + `/portal/${file}`;
                    })
                    .join('\n');
            }

            const siteUrl = (this.getConfig().get('siteUrl') || '').replace(/\/+$/, '');

            return siteUrl + '/oauth-callback.php';
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.model.entityType === 'AuthenticationProvider') {
                this.getCollectionFactory()
                    .create('Portal')
                    .then(collection => {
                        collection.data.select = ['url', 'isDefault'];

                        collection.fetch().then(() => {
                            this.portalCollection = collection;

                            this.reRender();
                        })
                    });
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/language', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getMetadata().get(['app', 'language', 'list']) || []);
            this.translatedOptions = Espo.Utils.clone(this.getLanguage().translate('language', 'options') || {});
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/history-entity-list', ['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {

            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (this.getMetadata().get('scopes.' + scope + '.disabled')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.object')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.activity')) return;

                return true;
            })
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/group-tab-list', ['views/settings/fields/tab-list'], function (Dep) {

    return Dep.extend({

        noGroups: true,

        noDelimiters: true,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/global-search-entity-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {

            this.params.options = Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    let defs = this.getMetadata().get(['scopes', scope]) || {};

                    if (defs.disabled || scope === 'Note') {
                        return;
                    }

                    return defs.customizable && defs.entity;
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/fiscal-year-shift', ['views/fields/enum-int'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = [];
            this.translatedOptions = {};

            var monthNameList = this.getLanguage().get('Global', 'lists', 'monthNames') || [];

            monthNameList.forEach((name, i) => {
                this.params.options.push(i);
                this.translatedOptions[i] = name;
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/email-address-lookup-entity-type-list',
['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (this.getMetadata().get(['scopes', scope, 'disabled'])) {
                    return;
                }

                if (!this.getMetadata().get(['scopes', scope, 'object'])) {
                    return;
                }

                if (~['User', 'Contact', 'Lead', 'Account'].indexOf(scope)) {
                    return true;
                }

                var type = this.getMetadata().get(['scopes', scope, 'type']);

                if (type === 'Company' || type === 'Person') {
                    return true;
                }
            })
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/default-currency', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.validations.push('existing');
        },

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getConfig().get('currencyList') || []);
        },

        validateExisting: function () {
            var currencyList = this.model.get('currencyList');

            if (!currencyList) {
                return;
            }

            var value = this.model.get(this.name);

            if (~currencyList.indexOf(value)) {
                return;
            }

            var msg = this.translate('fieldInvalid', 'messages').replace('{field}', this.getLabelText());

            this.showValidationMessage(msg);

            return true;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/date-format', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = this.getMetadata().get(['app', 'dateTime', 'dateFormatList']) || [];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/dashboard-layout', ['views/fields/base', 'lib!gridstack'], function (Dep, GridStack) {

    return Dep.extend({

        detailTemplate: 'settings/fields/dashboard-layout/detail',
        editTemplate: 'settings/fields/dashboard-layout/edit',

        validationElementSelector: 'button[data-action="addDashlet"]',

        WIDTH_MULTIPLIER: 3,

        events: {
            'click button[data-action="selectTab"]': function (e) {
                var tab = parseInt($(e.currentTarget).data('tab'));
                this.selectTab(tab);
            },
            'click [data-action="removeDashlet"]': function (e) {
                var id = $(e.currentTarget).data('id');
                this.removeDashlet(id);
            },
            'click [data-action="editDashlet"]': function (e) {
                var id = $(e.currentTarget).data('id');
                var name = $(e.currentTarget).data('name');

                this.editDashlet(id, name);
            },
            'click button[data-action="editTabs"]': function () {
                this.editTabs();
            },
            'click button[data-action="addDashlet"]': function () {
                this.createView('addDashlet', 'views/modals/add-dashlet', {
                    parentType: this.model.entityType,
                }, view => {
                    view.render();

                    this.listenToOnce(view, 'add', (name) => {
                        this.addDashlet(name);
                    });
                });
            },
        },

        data: function () {
            return {
                dashboardLayout: this.dashboardLayout,
                currentTab: this.currentTab,
                isEmpty: this.isEmpty(),
            };
        },

        hasLocked: function () {
            return this.model.entityType === 'Preferences';
        },

        setup: function () {
            this.dashboardLayout = Espo.Utils.cloneDeep(this.model.get(this.name) || []);
            this.dashletsOptions = Espo.Utils.cloneDeep(this.model.get('dashletsOptions') || {});

            if (this.hasLocked()) {
                this.dashboardLocked = this.model.get('dashboardLocked') || false;
            }

            this.listenTo(this.model, 'change', () => {
                if (this.model.hasChanged(this.name)) {
                    this.dashboardLayout = Espo.Utils.cloneDeep(this.model.get(this.name) || []);
                }

                if (this.model.hasChanged('dashletsOptions')) {
                    this.dashletsOptions = Espo.Utils.cloneDeep(this.model.get('dashletsOptions') || {});
                }

                if (this.model.hasChanged(this.name)) {
                    if (this.dashboardLayout.length) {
                        if (this.isDetailMode()) {
                            this.selectTab(0);
                        }
                    }
                }

                if (this.hasLocked()) {
                    this.dashboardLocked = this.model.get('dashboardLocked') || false;
                }
            });

            this.currentTab = -1;
            this.currentTabLayout = null;

            if (this.dashboardLayout.length) {
                this.selectTab(0);
            }
        },

        selectTab: function (tab) {
            this.currentTab = tab;
            this.setupCurrentTabLayout();

            if (this.isRendered()) {
                this.reRender()
                    .then(() => {
                        this.$el
                            .find(`[data-action="selectTab"][data-tab="${tab}"]`)
                            .focus();
                    })
            }
        },

        setupCurrentTabLayout: function () {
            if (!~this.currentTab) {
                this.currentTabLayout = null;
            }

            var tabLayout = this.dashboardLayout[this.currentTab].layout || [];

            tabLayout = GridStack.Utils.sort(tabLayout);

            this.currentTabLayout = tabLayout;
        },

        addDashletHtml: function (id, name) {
            var $item = this.prepareGridstackItem(id, name);

            this.grid.addWidget(
                $item.get(0),
                {
                    x: 0,
                    y: 0,
                    w: 2 * this.WIDTH_MULTIPLIER,
                    h: 2,
                }
            );
        },

        generateId: function () {
            return (Math.floor(Math.random() * 10000001)).toString();
        },

        addDashlet: function (name) {
            var id = 'd' + (Math.floor(Math.random() * 1000001)).toString();

            if (!~this.currentTab) {
                this.dashboardLayout.push({
                    name: 'My Espo',
                    layout: [],
                    id: this.generateId(),
                });

                this.currentTab = 0;
                this.setupCurrentTabLayout();

                this.once('after:render', () => {
                    setTimeout(() => {
                        this.addDashletHtml(id, name);
                        this.fetchLayout();
                    }, 50);
                });

                this.reRender();
            }
            else {
                this.addDashletHtml(id, name);
                this.fetchLayout();
            }
        },

        removeDashlet: function (id) {
            let $item = this.$gridstack.find('.grid-stack-item[data-id="'+id+'"]');

            this.grid.removeWidget($item.get(0), true);

            var layout = this.dashboardLayout[this.currentTab].layout;

            layout.forEach((o, i) => {
                if (o.id === id) {
                    layout.splice(i, 1);
                }
            });

            delete this.dashletsOptions[id];

            this.setupCurrentTabLayout();
        },

        editTabs: function () {
            let options = {
                dashboardLayout: this.dashboardLayout,
                tabListIsNotRequired: true,
            };

            if (this.hasLocked()) {
                options.dashboardLocked = this.dashboardLocked;
            }

            this.createView('editTabs', 'views/modals/edit-dashboard', options, view => {
                view.render();

                this.listenToOnce(view, 'after:save', data => {
                    view.close();

                    let dashboardLayout = [];

                    data.dashboardTabList.forEach(name => {
                        var layout = [];
                        var id = this.generateId();

                        this.dashboardLayout.forEach(d => {
                            if (d.name === name) {
                                layout = d.layout;
                                id = d.id;
                            }
                        });

                        if (name in data.renameMap) {
                            name = data.renameMap[name];
                        }

                        dashboardLayout.push({
                            name: name,
                            layout: layout,
                            id: id,
                        });
                    });

                    this.dashboardLayout = dashboardLayout;

                    if (this.hasLocked()) {
                        this.dashboardLocked = data.dashboardLocked;
                    }

                    this.selectTab(0);

                    this.deleteNotExistingDashletsOptions();
                });
            });
        },

        deleteNotExistingDashletsOptions: function () {
            var idListMet = [];

            (this.dashboardLayout || []).forEach((itemTab) => {
                (itemTab.layout || []).forEach((item) => {
                    idListMet.push(item.id);
                });
            });

            Object.keys(this.dashletsOptions).forEach((id) => {
                if (!~idListMet.indexOf(id)) {
                    delete this.dashletsOptions[id];
                }
            });
        },

        editDashlet: function (id, name) {
            var options = this.dashletsOptions[id] || {};
            options = Espo.Utils.cloneDeep(options);

            var defaultOptions = this.getMetadata().get(['dashlets', name , 'options', 'defaults']) || {};

            Object.keys(defaultOptions).forEach((item) => {
                if (item in options) {
                    return;
                }

                options[item] = Espo.Utils.cloneDeep(defaultOptions[item]);
            });

            if (!('title' in options)) {
                options.title = this.translate(name, 'dashlets');
            }

            var optionsView = this.getMetadata().get(['dashlets', name, 'options', 'view']) ||
                'views/dashlets/options/base';

            this.createView('options', optionsView, {
                name: name,
                optionsData: options,
                fields: this.getMetadata().get(['dashlets', name, 'options', 'fields']) || {},
                userId: this.model.entityType === 'Preferences' ? this.model.id : null,
            }, view => {
                view.render();

                this.listenToOnce(view, 'save', (attributes) => {
                    this.dashletsOptions[id] = attributes;

                    view.close();

                    if ('title' in attributes) {
                        var title = attributes.title;

                        if (!title) {
                            title = this.translate(name, 'dashlets');
                        }

                        this.$el.find('[data-id="'+id+'"] .panel-title').text(title);
                    }
                });
            });
        },

        fetchLayout: function () {
            if (!~this.currentTab) {
                return;
            }

            this.dashboardLayout[this.currentTab].layout = _.map(this.$gridstack.find('.grid-stack-item'), el => {
                var $el = $(el);

                let x = $el.attr('gs-x');
                let y = $el.attr('gs-y');
                let h = $el.attr('gs-h');
                let w = $el.attr('gs-w');

                return {
                    id: $el.data('id'),
                    name: $el.data('name'),
                    x: x / this.WIDTH_MULTIPLIER,
                    y: y,
                    width: w / this.WIDTH_MULTIPLIER,
                    height: h,
                };
            });

            this.setupCurrentTabLayout();
        },

        afterRender: function () {
            if (this.currentTabLayout) {
                var $gridstack = this.$gridstack = this.$el.find('> .grid-stack');

                var grid = this.grid = GridStack.init({
                    minWidth: 4,
                    cellHeight: 60,
                    margin: 10,
                    column: 12,
                    resizable: {
                        handles: 'se',
                        helper: false
                    },
                    disableOneColumnMode: true,
                    animate: false,
                    staticGrid: this.mode !== 'edit',
                    disableResize: this.mode !== 'edit',
                    disableDrag: this.mode !== 'edit',
                });

                grid.removeAll();

                this.currentTabLayout.forEach((o) => {
                    var $item = this.prepareGridstackItem(o.id, o.name);

                    this.grid.addWidget(
                        $item.get(0),
                        {
                            x: o.x * this.WIDTH_MULTIPLIER,
                            y: o.y,
                            w: o.width * this.WIDTH_MULTIPLIER,
                            h: o.height,
                        }
                    );
                });

                $gridstack.find(' .grid-stack-item').css('position', 'absolute');

                $gridstack.on('change', (e, itemList) => {
                    this.fetchLayout();
                    this.trigger('change');
                });
            }
        },

        prepareGridstackItem: function (id, name) {
            let $item = $('<div>').addClass('grid-stack-item');
            let actionsHtml = '';

            if (this.isEditMode()) {
                actionsHtml +=
                    $('<div>')
                        .addClass('btn-group pull-right')
                        .append(
                            $('<button>')
                                .addClass('btn btn-default')
                                .attr('data-action', 'removeDashlet')
                                .attr('data-id', id)
                                .attr('title', this.translate('Remove'))
                                .append(
                                    $('<span>').addClass('fas fa-times')
                                )
                        )
                        .get(0)
                        .outerHTML;

                actionsHtml += $('<div>')
                    .addClass('btn-group pull-right')
                    .append(
                        $('<button>')
                            .addClass('btn btn-default')
                            .attr('data-action', 'editDashlet')
                            .attr('data-id', id)
                            .attr('data-name', name)
                            .attr('title', this.translate('Edit'))
                            .append(
                                $('<span>')
                                    .addClass('fas fa-pencil-alt fa-sm')
                                    .css({
                                        position: 'relative',
                                        top: '-1px',
                                    })
                            )
                    )
                    .get(0)
                    .outerHTML;
            }

            let title = this.getOption(id, 'title');

            if (!title) {
                title = this.translate(name, 'dashlets');
            }

            let headerHtml = $('<div>')
                .addClass('panel-heading')
                .append(actionsHtml)
                .append(
                    $('<h4>').addClass('panel-title').text(title)
                )
                .get(0).outerHTML;

            let $container =
                $('<div>')
                    .addClass('grid-stack-item-content panel panel-default')
                    .append(headerHtml);

            $container.attr('data-id', id);
            $container.attr('data-name', name);
            $item.attr('data-id', id);
            $item.attr('data-name', name);
            $item.append($container);

            return $item;
        },

        getOption: function (id, optionName) {
            var options = (this.model.get('dashletsOptions') || {})[id] || {};

            return options[optionName];
        },

        isEmpty: function () {
            var isEmpty = true;

            if (this.dashboardLayout && this.dashboardLayout.length) {
                this.dashboardLayout.forEach((item) => {
                    if (item.layout && item.layout.length) {
                        isEmpty = false;
                    }
                });
            }

            return isEmpty;
        },

        validateRequired: function () {
            if (!this.isRequired()) {
                return;
            }

            if (this.isEmpty()) {
                var msg = this.translate('fieldIsRequired', 'messages').replace('{field}', this.getLabelText());
                this.showValidationMessage(msg);

                return true;
            }
        },

        fetch: function () {
            let data = {};

            if (!this.dashboardLayout || !this.dashboardLayout.length) {
                data[this.name] = null;
                data['dashletsOptions'] = {};

                return data;
            }

            data[this.name] = Espo.Utils.cloneDeep(this.dashboardLayout);

            data.dashletsOptions = Espo.Utils.cloneDeep(this.dashletsOptions);

            if (this.hasLocked()) {
                data.dashboardLocked = this.dashboardLocked;
            }

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/currency-rates', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'settings/fields/currency-rates/edit',

        data: function () {
            var baseCurrency = this.model.get('baseCurrency');
            var currencyRates = this.model.get('currencyRates') || {};

            var rateValues = {};

            (this.model.get('currencyList') || []).forEach(currency => {
                if (currency !== baseCurrency) {
                    rateValues[currency] = currencyRates[currency];

                    if (!rateValues[currency]) {
                        if (currencyRates[baseCurrency]) {
                            rateValues[currency] = Math.round(1 / currencyRates[baseCurrency] * 1000) / 1000;
                        }

                        if (!rateValues[currency]) {
                            rateValues[currency] = 1.00
                        }
                    }
                }
            });

            return {
                rateValues: rateValues,
                baseCurrency: baseCurrency,
            };
        },

        setup: function () {
        },

        fetch: function () {
            var data = {};
            var currencyRates = {};

            var baseCurrency = this.model.get('baseCurrency');

            var currencyList = this.model.get('currencyList') || [];

            currencyList.forEach(currency => {
                if (currency !== baseCurrency) {
                    currencyRates[currency] = parseFloat(
                        this.$el.find('input[data-currency="'+currency+'"]').val() || 1);
                }
            });

            delete currencyRates[baseCurrency];

            for (var c in currencyRates) {
                if (!~currencyList.indexOf(c)) {
                    delete currencyRates[c];
                }
            }

            data[this.name] = currencyRates;

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/currency-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        matchAnyWord: true,

        setupOptions: function () {
            this.params.options = this.getMetadata().get(['app', 'currency', 'list']) || [];
            this.translatedOptions = {};

            this.params.options.forEach(item => {
                var value = item

                var name = this.getLanguage().get('Currency', 'names', item);

                if (name) {
                    value += ' - ' + name;
                }

                this.translatedOptions[item] = value;
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/calendar-entity-list', ['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {

            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (this.getMetadata().get('scopes.' + scope + '.disabled')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.object')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.calendar')) return;

                return true;
            })
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/busy-ranges-entity-list', ['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (this.getMetadata().get(['scopes', scope, 'disabled'])) {
                    return;
                }

                if (!this.getMetadata().get(['scopes', scope, 'object'])) {
                    return;
                }

                if (!this.getMetadata().get(['scopes', scope, 'calendar'])) {
                    return;
                }

                return true;
            })
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/authentication-method', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = [];

            let defs = this.getMetadata().get(['authenticationMethods']) || {};

            for (let method in defs) {
                if (defs[method].settings && defs[method].settings.isAvailable) {
                    this.params.options.push(method);
                }
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/auth-two-fa-method-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = [];

            let defs = this.getMetadata().get(['app', 'authentication2FAMethods']) || {};

            for (let method in defs) {
                if (defs[method].settings && defs[method].settings.isAvailable) {
                    this.params.options.push(method);
                }
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/assignment-notifications-entity-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {

            this.params.options = Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                        return;
                    }

                    if (
                        this.getMetadata().get(['scopes', scope, 'stream'])
                        &&
                        !this.getMetadata().get(['entityDefs', scope, 'fields', 'assignedUsers'])
                    ) {
                        return;
                    }

                    return this.getMetadata().get('scopes.' + scope + '.notifications') &&
                           this.getMetadata().get('scopes.' + scope + '.entity');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/assignment-email-notifications-entity-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.params.options = Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    if (scope === 'Email') {
                        return;
                    }

                    if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                        return;
                    }

                    return this.getMetadata()
                            .get('scopes.' + scope + '.notifications') &&
                        this.getMetadata().get('scopes.' + scope + '.entity');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/address-preview', ['views/fields/address'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            var mainModel = this.model;
            var model = mainModel.clone();

            model.entityType = mainModel.entityType;
            model.name = mainModel.name;

            model.set({
                addressPreviewStreet: 'Street',
                addressPreviewPostalCode: 'PostalCode',
                addressPreviewCity: 'City',
                addressPreviewState: 'State',
                addressPreviewCountry: 'Country',
            });

            this.listenTo(mainModel, 'change:addressFormat', () => {
                model.set('addressFormat', mainModel.get('addressFormat'));

                this.reRender();
            });

            this.model = model;
        },

        getAddressFormat: function () {
            return this.model.get('addressFormat') || 1;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/settings/fields/activities-entity-list', ['views/fields/entity-type-list'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {

            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (scope === 'Email') return;
                if (this.getMetadata().get('scopes.' + scope + '.disabled')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.object')) return;
                if (!this.getMetadata().get('scopes.' + scope + '.activity')) return;

                return true;
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/edit', ['views/edit'], function (Dep) {

    return Dep.extend({

        userName: '',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.userName = this.model.get('name');
        },

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<span>').text(this.translate('Preferences')),
                $('<span>').text(this.userName),
            ]);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        sideView: null,

        saveAndContinueEditingAction: false,

        buttonList: [
            {
                name: 'save',
                label: 'Save',
                style: 'primary',
            },
            {
                name: 'cancel',
                label: 'Cancel',
            }
        ],

        dynamicLogicDefs: {
            fields: {
                'tabList': {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'useCustomTabList',
                            }
                        ]
                    }
                },
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.addDropdownItem({
                name: 'reset',
                text: this.getLanguage().translate('Reset to Default', 'labels', 'Admin'),
                style: 'danger'
            });

            var forbiddenEditFieldList = this.getAcl().getScopeForbiddenFieldList('Preferences', 'edit');

            if (!~forbiddenEditFieldList.indexOf('dashboardLayout') && !this.model.isPortal()) {
                this.addDropdownItem({
                    name: 'resetDashboard',
                    text: this.getLanguage().translate('Reset Dashboard to Default', 'labels', 'Preferences')
                });
            }

            if (this.model.isPortal()) {
                this.layoutName = 'detailPortal';
            }

            if (this.model.id === this.getUser().id) {
                this.on('after:save', () => {
                    let data = this.model.getClonedAttributes();

                    delete data['smtpPassword'];

                    this.getPreferences().set(data);
                    this.getPreferences().trigger('update');
                });
            }

            if (!this.getUser().isAdmin() || this.model.isPortal()) {
                this.hideField('dashboardLayout');
            }

            this.controlFollowCreatedEntityListVisibility();
            this.listenTo(this.model, 'change:followCreatedEntities', this.controlFollowCreatedEntityListVisibility);

            this.controlColorsField();
            this.listenTo(this.model, 'change:scopeColorsDisabled', this.controlColorsField, this);

            var hideNotificationPanel = true;

            if (!this.getConfig().get('assignmentEmailNotifications') || this.model.isPortal()) {
                this.hideField('receiveAssignmentEmailNotifications');
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            } else {
                hideNotificationPanel = false;

                this.controlAssignmentEmailNotificationsVisibility();

                this.listenTo(this.model, 'change:receiveAssignmentEmailNotifications', () => {
                    this.controlAssignmentEmailNotificationsVisibility();
                });
            }

            if ((this.getConfig().get('assignmentEmailNotificationsEntityList') || []).length === 0) {
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            }

            if (
                (this.getConfig().get('assignmentNotificationsEntityList') || []).length === 0 ||
                this.model.isPortal()
            ) {
                this.hideField('assignmentNotificationsIgnoreEntityTypeList');
            } else {
                hideNotificationPanel = false;
            }

            if (this.getConfig().get('emailForceUseExternalClient')) {
                this.hideField('emailUseExternalClient');
            }

            if (!this.getConfig().get('mentionEmailNotifications') || this.model.isPortal()) {
                this.hideField('receiveMentionEmailNotifications');
            } else {
                hideNotificationPanel = false;
            }

            if (!this.getConfig().get('streamEmailNotifications') && !this.model.isPortal()) {
                this.hideField('receiveStreamEmailNotifications');
            } else if (!this.getConfig().get('portalStreamEmailNotifications') && this.model.isPortal()) {
                this.hideField('receiveStreamEmailNotifications');
            } else {
                hideNotificationPanel = false;
            }

            if (this.getConfig().get('scopeColorsDisabled')) {
                this.hideField('scopeColorsDisabled');
                this.hideField('tabColorsDisabled');
            }

            if (this.getConfig().get('tabColorsDisabled')) {
                this.hideField('tabColorsDisabled');
            }

            if (hideNotificationPanel) {
                this.hidePanel('notifications');
            }

            if (this.getConfig().get('userThemesDisabled')) {
                this.hideField('theme');
            }

            this.on('save', initialAttributes => {
                if (
                    this.model.get('language') !== initialAttributes.language ||
                    this.model.get('theme') !== initialAttributes.theme ||
                    (this.model.get('themeParams') || {}).navbar !== (initialAttributes.themeParams || {}).navbar
                ) {
                    this.setConfirmLeaveOut(false);

                    window.location.reload();
                }
            });
        },

        controlFollowCreatedEntityListVisibility: function () {
            if (!this.model.get('followCreatedEntities')) {
                this.showField('followCreatedEntityTypeList');
            } else {
                this.hideField('followCreatedEntityTypeList');
            }
        },

        controlColorsField: function () {
            if (this.model.get('scopeColorsDisabled')) {
                this.hideField('tabColorsDisabled');
            } else {
                this.showField('tabColorsDisabled');
            }
        },

        controlAssignmentEmailNotificationsVisibility: function () {
            if (this.model.get('receiveAssignmentEmailNotifications')) {
                this.showField('assignmentEmailNotificationsIgnoreEntityTypeList');
            } else {
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            }
        },

        actionReset: function () {
            this.confirm(this.translate('resetPreferencesConfirmation', 'messages'), () => {
                Espo.Ajax
                    .deleteRequest('Preferences/' + this.model.id)
                    .then(() => {
                        Espo.Ui.success(this.translate('resetPreferencesDone', 'messages'));

                        this.model.set(data);

                        for (let attribute in data) {
                            this.setInitialAttributeValue(attribute, data[attribute]);
                        }

                        this.getPreferences().set(this.model.getClonedAttributes());
                        this.getPreferences().trigger('update');

                        this.setIsNotChanged();
                    });
            });
        },

        actionResetDashboard: function () {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax.postRequest('Preferences/action/resetDashboard', {id: this.model.id})
                    .then(data =>  {
                        Espo.Ui.success(this.translate('Done'));

                        this.model.set(data);

                        for (var attribute in data) {
                            this.setInitialAttributeValue(attribute, data[attribute]);
                        }

                        this.getPreferences().set(this.model.getClonedAttributes());
                        this.getPreferences().trigger('update');
                    });
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        exit: function (after) {
            if (after === 'cancel') {
                var url = '#User/view/' + this.model.id;

                if (!this.getAcl().checkModel(this.getUser())) {
                    url = '#';
                }

                this.getRouter().navigate(url, {trigger: true});
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/week-start', ['views/fields/enum-int'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.params.options);

            this.params.options.unshift(-1);

            this.translatedOptions = {};

            var dayList = this.getLanguage().get('Global', 'lists', 'dayNames') || [];

            dayList.forEach((item, i) => {
                this.translatedOptions[i] = item;
            });

            var defaultWeekStart = this.getConfig().get('weekStart');

            this.translatedOptions[-1] = this.translate('Default') +
                ' (' + dayList[defaultWeekStart] +
                ')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/time-zone', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getHelper().getAppParam('timeZoneList')) || [];
            this.params.options.unshift('');

            this.translatedOptions = this.translatedOptions || {};
            this.translatedOptions[''] = this.translate('Default') + ' (' + this.getConfig().get('timeZone') + ')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/time-format', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(
                this.getMetadata().get(['app', 'dateTime', 'timeFormatList']) || []
            );

            this.params.options.unshift('');

            this.translatedOptions = this.translatedOptions || {};

            this.translatedOptions[''] = this.translate('Default') +
                ' (' + this.getConfig().get('timeFormat') +')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/theme', ['views/settings/fields/theme'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Object.keys(this.getMetadata().get('themes') || {})
                .sort((v1, v2) => {
                    if (v2 === 'EspoRtl') {
                        return -1;
                    }

                    return this.translate(v1, 'themes').localeCompare(this.translate(v2, 'themes'));
                });

            this.params.options.unshift('');
        },

        setupTranslation: function () {
            Dep.prototype.setupTranslation.call(this);

            this.translatedOptions = this.translatedOptions || {};

            let defaultTheme = this.getConfig().get('theme');
            let defaultTranslated = this.translatedOptions[defaultTheme] || defaultTheme;

            this.translatedOptions[''] = this.translate('Default') + ' (' + defaultTranslated + ')';
        },

        afterRenderDetail: function () {
            let navbar = this.getNavbarValue() || this.getDefaultNavbar();

            if (navbar) {
                this.$el
                    .append(' ')
                    .append(
                        $('<span>').addClass('text-muted chevron-right')
                    )
                    .append(' ')
                    .append(
                        $('<span>').text(this.translate(navbar, 'themeNavbars'))
                    )
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/tab-list', ['views/settings/fields/tab-list'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.params.options = this.params.options.filter(scope => {
                if (scope === '_delimiter_' || scope === 'Home') {
                    return true;
                }

                let defs = this.getMetadata().get(['scopes', scope]);

                if (!defs) {
                    return;
                }

                if (defs.disabled) {
                    return;
                }

                if (defs.acl) {
                    return this.getAcl().check(scope);
                }

                if (defs.tabAclPermission) {
                    let level = this.getAcl().get(defs.tabAclPermission);

                    return level && level !== 'no';
                }

                return true;
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/signature', ['views/fields/wysiwyg'], function (Dep) {

    return Dep.extend({

        fetchEmptyValueAsNull: true,

        toolbar: [
            ["style", ["bold", "italic", "underline", "clear"]],
            ["color", ["color"]],
            ["height", ["height"]],
            ['table', ['espoLink']],
            ["misc",["codeview", "fullscreen"]],
        ],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/language', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options =
                Espo.Utils.clone(this.getMetadata().get(['app', 'language', 'list']) || [])
                    .sort((v1, v2) => {
                        return this.getLanguage().translateOption(v1, 'language')
                            .localeCompare(this.getLanguage().translateOption(v2, 'language'));
                    });

            this.params.options.unshift('');

            this.translatedOptions = Espo.Utils.clone(this.getLanguage().translate('language', 'options') || {});

            var defaultTranslated =  this.translatedOptions[this.getConfig().get('language')] || this.getConfig().get('language');

            this.translatedOptions[''] = this.translate('Default') + ' (' + defaultTranslated + ')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/default-currency', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getConfig().get('currencyList') || []);
            this.params.options.unshift('');

            this.translatedOptions = this.translatedOptions || {};
            this.translatedOptions[''] = this.translate('Default') +
                ' (' + this.getConfig().get('defaultCurrency') +')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/date-format', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(
                this.getMetadata().get(['app', 'dateTime', 'dateFormatList']) || []
            );

            this.params.options.unshift('');

            this.translatedOptions = this.translatedOptions || {};

            this.translatedOptions[''] = this.translate('Default') +
                ' (' + this.getConfig().get('dateFormat') +')';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/dashboard-tab-list', ['views/fields/array'], function (Dep) {

    return Dep.extend({

        maxItemLength: 36,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.translatedOptions = {};

            let list = this.model.get(this.name) || [];

            list.forEach(value => {
                this.translatedOptions[value] = value;
            });

            this.validations.push('uniqueLabel');
        },

        getItemHtml: function (value) {
            value = value.toString();

            let translatedValue = this.translatedOptions[value] || value;

            return $('<div>')
                .addClass('list-group-item link-with-role form-inline')
                .attr('data-value', value)
                .append(
                    $('<div>')
                        .addClass('pull-left')
                        .css('width', '92%')
                        .css('display', 'inline-block')
                        .append(
                            $('<input>')
                                .attr('maxLength', this.maxItemLength)
                                .attr('data-name', 'translatedValue')
                                .attr('data-value', value)
                                .addClass('role form-control input-sm')
                                .attr('value', translatedValue)
                                .css('width', '65%')
                        )
                )
                .append(
                    $('<div>')
                        .css('width', '8%')
                        .css('display', 'inline-block')
                        .css('vertical-align', 'top')
                        .append(
                            $('<a>')
                                .attr('role', 'button')
                                .attr('tabindex', '0')
                                .addClass('pull-right')
                                .attr('data-value', value)
                                .attr('data-action', 'removeValue')
                                .append(
                                    $('<span>').addClass('fas fa-times')
                                )
                        )
                )
                .append(
                    $('<br>').css('clear', 'both')
                )
                .get(0).outerHTML;
        },

        validateUniqueLabel: function () {
            let keyList = this.model.get(this.name) || [];
            let labels = this.model.get('translatedOptions') || {};
            let metLabelList = [];

            for (let key of keyList) {
                let label = labels[key];

                if (!label) {
                    return true;
                }

                if (metLabelList.indexOf(label) !== -1) {
                    return true;
                }

                metLabelList.push(label);
            }

            return false;
        },

        fetch: function () {
            let data = Dep.prototype.fetch.call(this);

            data.translatedOptions = {};

            (data[this.name] || []).forEach(value => {
                let valueInternal = value.replace(/"/g, '\\"');

                data.translatedOptions[value] = this.$el
                    .find('input[data-name="translatedValue"][data-value="'+valueInternal+'"]')
                    .val() || value;
            });

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/auto-follow-entity-type-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.params.options = Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                        return;
                    }

                    return this.getMetadata().get('scopes.' + scope + '.entity') &&
                        this.getMetadata().get('scopes.' + scope + '.stream');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            Dep.prototype.setup.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/assignment-notifications-ignore-entity-type-list',
['views/fields/checklist'], function (Dep) {

    return Dep.extend({

        isInversed: true,

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getConfig().get('assignmentNotificationsEntityList')) || [];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/preferences/fields/assignment-email-notifications-ignore-entity-type-list',
['views/fields/checklist'], function (Dep) {

    return Dep.extend({

        isInversed: true,

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(
                this.getConfig().get('assignmentEmailNotificationsEntityList')) || [];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/portal-user/list', ['views/list'], function (Dep) {

    return Dep.extend({

        defaultOrderBy: 'createdAt',

        defaultOrder: 'desc',

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        actionCreate: function () {
            var viewName = 'crm:views/contact/modals/select-for-portal-user';

            this.createView('modal', viewName, {
                scope: 'Contact',
                primaryFilterName: 'notPortalUsers',
                createButton: false,
                mandatorySelectAttributeList: [
                    'salutationName',
                    'firstName',
                    'lastName',
                    'accountName',
                    'accountId',
                    'emailAddress',
                    'emailAddressData',
                    'phoneNumber',
                    'phoneNumberData',
                ]
            }, view => {
                view.render();

                this.listenToOnce(view, 'select', model => {
                    var attributes = {};

                    attributes.contactId = model.id;
                    attributes.contactName = model.get('name');

                    if (model.get('accountId')) {
                        var names = {};
                        names[model.get('accountId')] = model.get('accountName');

                        attributes.accountsIds = [model.get('accountId')];
                        attributes.accountsNames = names;
                    }

                    attributes.firstName = model.get('firstName');
                    attributes.lastName = model.get('lastName');
                    attributes.salutationName = model.get('salutationName');

                    attributes.emailAddress = model.get('emailAddress');
                    attributes.emailAddressData = model.get('emailAddressData');

                    attributes.phoneNumber = model.get('phoneNumber');
                    attributes.phoneNumberData = model.get('phoneNumberData');

                    attributes.userName = attributes.emailAddress;

                    attributes.type = 'portal';

                    var router = this.getRouter();

                    var url = '#' + this.scope + '/create';

                    router.dispatch(this.scope, 'create', {
                        attributes: attributes
                    });

                    router.navigate(url, {trigger: false});
                });

                this.listenToOnce(view, 'skip', () => {
                    var attributes = {
                        type: 'portal',
                    };

                    var router = this.getRouter();
                    var url = '#' + this.scope + '/create';

                    router.dispatch(this.scope, 'create', {
                        attributes: attributes
                    });

                    router.navigate(url, {trigger: false});
                });
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/portal/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: [
            'remove',
        ],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/portal/fields/tab-list', ['views/settings/fields/tab-list'], function (Dep) {

    return Dep.extend({

        noGroups: true,

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.params.options.filter(tab => {
                if (tab === '_delimiter_') {
                    return true;
                }

                if (!!this.getMetadata().get('scopes.' + tab + '.aclPortal')) {
                    return true;
                }
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/portal/fields/quick-create-list', ['views/settings/fields/quick-create-list'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.params.options = this.params.options.filter(tab => {
                if (!!this.getMetadata().get('scopes.' + tab + '.aclPortal')) {
                    return true;
                }
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/portal/fields/custom-id', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this, 'change', () => {
                var value = this.model.get('customId');

                if (!value || value === '') {
                    return;
                }

                value = value.replace(/ /i, '-').toLowerCase();
                value = encodeURIComponent(value);

                this.model.set('customId', value);
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/personal-data/record/record', ['views/record/base'], function (Dep) {

    return Dep.extend({

        template: 'personal-data/record/record',

        additionalEvents: {
            'click .checkbox': function (e) {
                var name = $(e.currentTarget).data('name');

                if (e.currentTarget.checked) {
                    if (!~this.checkedFieldList.indexOf(name)) {
                        this.checkedFieldList.push(name);
                    }

                    if (this.checkedFieldList.length === this.fieldList.length) {
                        this.$el.find('.checkbox-all').prop('checked', true);
                    } else {
                        this.$el.find('.checkbox-all').prop('checked', false);
                    }
                } else {
                    var index = this.checkedFieldList.indexOf(name);

                    if (~index) {
                        this.checkedFieldList.splice(index, 1);
                    }

                    this.$el.find('.checkbox-all').prop('checked', false);
                }

                this.trigger('check', this.checkedFieldList);
            },

            'click .checkbox-all': function (e) {
                if (e.currentTarget.checked) {
                    this.checkedFieldList = Espo.Utils.clone(this.fieldList);

                    this.$el.find('.checkbox').prop('checked', true);
                } else {
                    this.checkedFieldList = [];

                    this.$el.find('.checkbox').prop('checked', false);
                }

                this.trigger('check', this.checkedFieldList);
            },
        },

        data: function () {
            var data = {};

            data.fieldDataList = this.getFieldDataList();
            data.scope = this.scope;
            data.editAccess = this.editAccess;

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events = {
                ...this.additionalEvents,
                ...this.events,
            };

            this.scope = this.model.entityType;

            this.fieldList = [];
            this.checkedFieldList = [];

            this.editAccess = this.getAcl().check(this.model, 'edit');

            var fieldDefs = this.getMetadata().get(['entityDefs', this.scope, 'fields']) || {};

            var fieldList = [];

            for (var field in fieldDefs) {
                var defs = fieldDefs[field];

                if (defs.isPersonalData) {
                    fieldList.push(field);
                }
            }

            fieldList.forEach(field => {
                var type = fieldDefs[field].type;
                var attributeList = this.getFieldManager().getActualAttributeList(type, field);

                var isNotEmpty = false;

                attributeList.forEach(attribute => {
                    var value = this.model.get(attribute);

                    if (value) {
                        if (Object.prototype.toString.call(value) === '[object Array]') {
                            if (value.length) {
                                return;
                            }
                        }

                        isNotEmpty = true;
                    }
                });

                var hasAccess = !~this.getAcl().getScopeForbiddenFieldList(this.scope, 'view').indexOf(field);

                if (isNotEmpty && hasAccess) {
                    this.fieldList.push(field);
                }
            });

            this.fieldList = this.fieldList.sort((v1, v2) => {
                return this.translate(v1, 'fields', this.scope)
                    .localeCompare(this.translate(v2, 'fields', this.scope));
            });

            this.fieldList.forEach(field => {
                this.createField(field, null, null, 'detail', true);
            });
        },

        getFieldDataList: function () {
            var forbiddenList = this.getAcl().getScopeForbiddenFieldList(this.scope, 'edit');

            var list = [];

            this.fieldList.forEach(field => {
                list.push({
                    name: field,
                    key: field + 'Field',
                    editAccess: this.editAccess && !~forbiddenList.indexOf(field),
                });
            });

            return list;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/personal-data/modals/personal-data', ['views/modal'], function (Dep) {

    return Dep.extend({

        className: 'dialog dialog-record',

        template: 'personal-data/modals/personal-data',

        backdrop: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.buttonList = [
                {
                    name: 'cancel',
                    label: 'Close'
                },
            ];

            this.headerText = this.getLanguage().translate('Personal Data');
            this.headerText += ': ' + this.model.get('name');

            if (this.getAcl().check(this.model, 'edit')) {
                this.buttonList.unshift({
                    name: 'erase',
                    label: 'Erase',
                    style: 'danger',
                    disabled: true,
                });
            }

            this.fieldList = [];

            this.scope = this.model.entityType;

            this.createView('record', 'views/personal-data/record/record', {
                selector: '.record',
                model: this.model
            }, (view) => {
                this.listenTo(view, 'check', (fieldList) => {
                    this.fieldList = fieldList;

                    if (fieldList.length) {
                        this.enableButton('erase');
                    } else {
                        this.disableButton('erase');
                    }
                });

                if (!view.fieldList.length) {
                    this.disableButton('export');
                }
            });
        },

        actionErase: function () {
            this.confirm({
                message: this.translate('erasePersonalDataConfirmation', 'messages'),
                confirmText: this.translate('Erase')
            }, () => {
                this.disableButton('erase');

                Espo.Ajax.postRequest('DataPrivacy/action/erase', {
                    fieldList: this.fieldList,
                    entityType: this.scope,
                    id: this.model.id,
                }).then(() => {
                    Espo.Ui.success(this.translate('Done'));

                    this.trigger('erase');
                })
                .catch(() => {
                    this.enableButton('erase');
                });
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/outbound-email/modals/test-send', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'test-send',

        templateContent: `
            <label class="control-label">{{translate \'Email Address\' scope=\'Email\'}}</label>
            <input type="text" name="emailAddress" value="{{emailAddress}}" class="form-control">
        `,

        data: function () {
            return {
                emailAddress: this.options.emailAddress,
            };
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'send',
                    text: this.translate('Send', 'labels', 'Email'),
                    style: 'primary',
                    onClick: () => {
                        var emailAddress = this.$el.find('input').val();

                        if (emailAddress === '') {
                            return;
                        }

                        this.trigger('send', emailAddress);
                    },
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: dialog =>{
                        dialog.close();
                    },
                }
            ];
        },
    });
});

define("views/notification/record/list", ["exports", "views/record/list-expanded"], function (_exports, _listExpanded) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _listExpanded = _interopRequireDefault(_listExpanded);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/notification/record/list */

  class NotificationListRecordView extends _listExpanded.default {
    /**
     * @name collection
     * @type module:collections/note
     * @memberOf NotificationListRecordView#
     */

    setup() {
      super.setup();
      this.listenTo(this.collection, 'sync', (c, r, options) => {
        if (!options.fetchNew) {
          return;
        }
        let lengthBeforeFetch = options.lengthBeforeFetch || 0;
        if (lengthBeforeFetch === 0) {
          this.reRender();
          return;
        }
        let $list = this.$el.find(this.listContainerEl);
        let rowCount = this.collection.length - lengthBeforeFetch;
        for (let i = rowCount - 1; i >= 0; i--) {
          let model = this.collection.at(i);
          $list.prepend($(this.getRowContainerHtml(model.id)));
          this.buildRow(i, model, view => {
            view.render();
          });
        }
      });
      this.events['auxclick a[href][data-scope][data-id]'] = e => {
        let isCombination = e.button === 1 && (e.ctrlKey || e.metaKey);
        if (!isCombination) {
          return;
        }
        let $target = $(e.currentTarget);
        let id = $target.attr('data-id');
        let scope = $target.attr('data-scope');
        e.preventDefault();
        e.stopPropagation();
        this.actionQuickView({
          id: id,
          scope: scope
        });
      };
    }
    showNewRecords() {
      this.collection.fetchNew();
    }
  }
  var _default = NotificationListRecordView;
  _exports.default = _default;
});

define("views/notification/items/system", ["exports", "views/notification/items/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class SystemNotificationItemView extends _base.default {
    template = 'notification/items/system';
    data() {
      return {
        ...super.data(),
        message: this.model.get('message')
      };
    }
    setup() {
      let data = this.model.get('data') || {};
      this.userId = data.userId;
    }
  }
  var _default = SystemNotificationItemView;
  _exports.default = _default;
});

define("views/notification/items/message", ["exports", "views/notification/items/base", "marked", "dompurify"], function (_exports, _base, _marked, _dompurify) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  _dompurify = _interopRequireDefault(_dompurify);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class MessageNotificationItemView extends _base.default {
    template = 'notification/items/message';
    data() {
      return {
        ...super.data(),
        style: this.style
      };
    }
    setup() {
      let data = /** @type Object.<string, *> */this.model.get('data') || {};
      let messageRaw = this.model.get('message') || data.message || '';
      let message = _marked.marked.parse(messageRaw);
      this.messageTemplate = _dompurify.default.sanitize(message, {}).toString();
      this.userId = data.userId;
      this.style = data.style || 'text-muted';
      this.messageData['entityType'] = this.translateEntityType(data.entityType);
      this.messageData['user'] = $('<a>').attr('href', '#User/view/' + data.userId).attr('data-id', data.userId).attr('data-scope', 'User').text(data.userName);
      this.messageData['entity'] = $('<a>').attr('href', '#' + data.entityType + '/view/' + data.entityId).attr('data-id', data.entityId).attr('data-scope', data.entityType).text(data.entityName);
      this.createMessage();
    }
  }
  var _default = MessageNotificationItemView;
  _exports.default = _default;
});

define("views/notification/items/entity-removed", ["exports", "views/notification/items/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailRemovedNotificationItemView extends _base.default {
    messageName = 'entityRemoved';
    template = 'notification/items/entity-removed';
    setup() {
      let data = /** @type Object.<string, *> */this.model.get('data') || {};
      this.userId = data.userId;
      this.messageData['entityType'] = this.translateEntityType(data.entityType);
      this.messageData['user'] = $('<a>').attr('href', '#User/view/' + data.userId).attr('data-id', data.userId).attr('data-scope', 'User').text(data.userName);
      this.messageData['entity'] = $('<a>').attr('href', '#' + data.entityType + '/view/' + data.entityId).attr('data-id', data.entityId).attr('data-scope', data.entityType).text(data.entityName);
      this.createMessage();
    }
  }
  var _default = EmailRemovedNotificationItemView;
  _exports.default = _default;
});

define("views/notification/items/email-received", ["exports", "views/notification/items/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailReceivedNotificationItemView extends _base.default {
    messageName = 'emailReceived';
    template = 'notification/items/email-received';
    data() {
      return {
        ...super.data(),
        emailId: this.emailId,
        emailName: this.emailName
      };
    }
    setup() {
      let data = /** @type Object.<string, *> */this.model.get('data') || {};
      this.userId = data.userId;
      this.messageData['entityType'] = this.translateEntityType(data.entityType);
      if (data.personEntityId) {
        this.messageData['from'] = $('<a>').attr('href', '#' + data.personEntityType + '/view/' + data.personEntityId).attr('data-id', data.personEntityId).attr('data-scope', data.personEntityType).text(data.personEntityName);
      } else {
        let text = data.fromString || this.translate('empty address');
        this.messageData['from'] = $('<span>').text(text);
      }
      this.emailId = data.emailId;
      this.emailName = data.emailName;
      this.createMessage();
    }
  }
  var _default = EmailReceivedNotificationItemView;
  _exports.default = _default;
});

define("views/notification/items/assign", ["exports", "views/notification/items/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class AssignNotificationItemView extends _base.default {
    messageName = 'assign';
    template = 'notification/items/assign';
    setup() {
      let data = this.model.get('data') || {};
      this.userId = data.userId;
      this.messageData['entityType'] = this.translateEntityType(data.entityType);
      this.messageData['entity'] = $('<a>').attr('href', '#' + data.entityType + '/view/' + data.entityId).attr('data-id', data.entityId).attr('data-scope', data.entityType).text(data.entityName);
      this.messageData['user'] = $('<a>').attr('href', '#User/view/' + data.userId).attr('data-id', data.userId).attr('data-scope', 'User').text(data.userName);
      this.createMessage();
    }
  }
  var _default = AssignNotificationItemView;
  _exports.default = _default;
});

define("views/notification/fields/read", ["exports", "views/fields/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class NotificationReadFieldView extends _base.default {
    type = 'read';
    listTemplate = 'notification/fields/read';
    detailTemplate = 'notification/fields/read';
    data() {
      return {
        isRead: this.model.get('read')
      };
    }
  }
  var _default = NotificationReadFieldView;
  _exports.default = _default;
});

define("views/notification/fields/read-with-menu", ["exports", "views/fields/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class NotificationReadWithMenuFieldView extends _base.default {
    type = 'read';
    listTemplate = 'notification/fields/read-with-menu';
    detailTemplate = 'notification/fields/read-with-menu';
    data() {
      return {
        isRead: this.model.get('read')
      };
    }
  }
  var _default = NotificationReadWithMenuFieldView;
  _exports.default = _default;
});

define("views/notification/fields/container", ["exports", "views/fields/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class NotificationContainerFieldView extends _base.default {
    type = 'notification';
    listTemplate = 'notification/fields/container';
    detailTemplate = 'notification/fields/container';
    setup() {
      switch (this.model.get('type')) {
        case 'Note':
          this.processNote(this.model.get('noteData'));
          break;
        case 'MentionInPost':
          this.processMentionInPost(this.model.get('noteData'));
          break;
        default:
          this.process();
      }
    }
    process() {
      let type = this.model.get('type');
      if (!type) {
        return;
      }
      type = type.replace(/ /g, '');
      let viewName = this.getMetadata().get('clientDefs.Notification.itemViews.' + type) || 'views/notification/items/' + Espo.Utils.camelCaseToHyphen(type);
      this.createView('notification', viewName, {
        model: this.model,
        fullSelector: this.options.containerSelector + ' li[data-id="' + this.model.id + '"]'
      });
    }
    processNote(data) {
      if (!data) {
        return;
      }
      this.wait(true);
      this.getModelFactory().create('Note', model => {
        model.set(data);
        let viewName = this.getMetadata().get('clientDefs.Note.itemViews.' + data.type) || 'views/stream/notes/' + Espo.Utils.camelCaseToHyphen(data.type);
        this.createView('notification', viewName, {
          model: model,
          isUserStream: true,
          fullSelector: this.options.containerSelector + ' li[data-id="' + this.model.id + '"]',
          onlyContent: true,
          isNotification: true
        });
        this.wait(false);
      });
    }
    processMentionInPost(data) {
      if (!data) {
        return;
      }
      this.wait(true);
      this.getModelFactory().create('Note', model => {
        model.set(data);
        let viewName = 'views/stream/notes/mention-in-post';
        this.createView('notification', viewName, {
          model: model,
          userId: this.model.get('userId'),
          isUserStream: true,
          fullSelector: this.options.containerSelector + ' li[data-id="' + this.model.id + '"]',
          onlyContent: true,
          isNotification: true
        });
        this.wait(false);
      });
    }
  }
  var _default = NotificationContainerFieldView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/last-viewed/list', ['views/list'], function (Dep) {

    return Dep.extend({

        searchPanel: false,

        createButton: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.collection.url = 'LastViewed';
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/last-viewed/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        layoutName: 'listForLastViewed',

        rowActionsDisabled: true,
        massActionsDisabled: true,
        headerDisabled: true,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/import-error/fields/validation-failures', ['views/fields/base'], (Dep) => {

    /**
     * @class
     * @name Class
     * @extends module:views/fields/base
     * @memberOf module:views/import-error/fields/validation-failures
     */
    return Dep.extend(/** @lends module:views/import-error/fields/validation-failures.Class# */{

        detailTemplateContent: `
            {{#if itemList.length}}
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 50%;">{{translate 'Field'}}</th>
                        <th>{{translateOption 'Validation' scope='ImportError' field='type'}}</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each itemList}}
                    <tr>
                        <td>{{translate field category='fields' scope=entityType}}</td>
                        <td>
                            {{translate type category='fieldValidations'}}
                            {{#if popoverText}}
                            <a
                                role="button"
                                tabindex="-1"
                                class="text-muted popover-anchor"
                                data-text="{{popoverText}}"
                            ><span class="fas fa-info-circle"></span></a>
                            {{/if}}
                        </td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            {{else}}
            <span class="none-value">{{translate 'None'}}</span>
            {{/if}}
        `,

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.itemList = this.getDataList();

            return data;
        },

        afterRenderDetail: function () {
            this.$el.find('.popover-anchor').each((i, el) => {
                let text = this.getHelper().transformMarkdownText(el.dataset.text).toString();

                Espo.Ui.popover($(el), {content: text}, this);
            });
        },

        /**
         * @return {Object[]}
         */
        getDataList: function () {
            let itemList = Espo.Utils.cloneDeep(this.model.get(this.name)) || [];

            let entityType = this.model.get('entityType');

            if (Array.isArray(itemList)) {
                itemList.forEach(item => {
                    /** @var {module:field-manager} */
                    let fieldManager = this.getFieldManager();
                    /** @var {module:language} */
                    let language = this.getLanguage();

                    let fieldType = fieldManager.getEntityTypeFieldParam(entityType, item.field, 'type');

                    if (!fieldType) {
                        return;
                    }

                    let key = fieldType + '_' + item.type;

                    if (!language.has(key, 'fieldValidationExplanations', 'Global')) {
                        return;
                    }

                    item.popoverText = language.translate(key, 'fieldValidationExplanations');
                });
            }

            return itemList;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/import-error/fields/line-number', ['views/fields/int'], (Dep) => {

    return Dep.extend({

        disableFormatting: true,

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.valueIsSet = this.model.has(this.sourceName);
            data.isNotEmpty = this.model.has(this.sourceName);

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.sourceName = this.name === 'exportLineNumber' ?
                'exportRowIndex' :
                'rowIndex';
        },

        getAttributeList: function () {
            return [this.sourceName];
        },

        getValueForDisplay: function () {
            let value = this.model.get(this.sourceName);

            value++;

            return this.formatNumber(value);
        },
    });
});

define("views/import/step2", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class Step2ImportView extends _view.default {
    template = 'import/step-2';
    allowedFieldList = ['createdAt', 'createdBy'];
    events = {
      /** @this Step2ImportView */
      'click button[data-action="back"]': function () {
        this.back();
      },
      /** @this Step2ImportView */
      'click button[data-action="next"]': function () {
        this.next();
      },
      /** @this Step2ImportView */
      'click a[data-action="addField"]': function (e) {
        const field = $(e.currentTarget).data('name');
        this.addField(field);
      },
      /** @this Step2ImportView */
      'click a[data-action="removeField"]': function (e) {
        const field = $(e.currentTarget).data('name');
        this.$el.find('a[data-action="addField"]').parent().removeClass('hidden');
        const index = this.additionalFields.indexOf(field);
        if (~index) {
          this.additionalFields.splice(index, 1);
        }
        this.$el.find('.field[data-name="' + field + '"]').parent().remove();
      }
    };
    data() {
      return {
        scope: this.scope,
        fieldList: this.getFieldList()
      };
    }
    setup() {
      this.formData = this.options.formData;
      this.scope = this.formData.entityType;
      const mapping = [];
      this.additionalFields = [];
      if (this.formData.previewArray) {
        let index = 0;
        if (this.formData.headerRow) {
          index = 1;
        }
        if (this.formData.previewArray.length > index) {
          this.formData.previewArray[index].forEach((value, i) => {
            const d = {
              value: value
            };
            if (this.formData.headerRow) {
              d.name = this.formData.previewArray[0][i];
            }
            mapping.push(d);
          });
        }
      }
      this.wait(true);
      this.getModelFactory().create(this.scope, model => {
        this.model = model;
        if (this.formData.defaultValues) {
          this.model.set(this.formData.defaultValues);
        }
        this.wait(false);
      });
      this.mapping = mapping;
    }
    afterRender() {
      const $container = $('#mapping-container');
      const $table = $('<table>').addClass('table').addClass('table-bordered').css('table-layout', 'fixed');
      const $tbody = $('<tbody>').appendTo($table);
      let $row = $('<tr>');
      if (this.formData.headerRow) {
        const $cell = $('<th>').attr('width', '25%').text(this.translate('Header Row Value', 'labels', 'Import'));
        $row.append($cell);
      }
      let $cell = $('<th>').attr('width', '25%').text(this.translate('Field', 'labels', 'Import'));
      $row.append($cell);
      $cell = $('<th>').text(this.translate('First Row Value', 'labels', 'Import'));
      $row.append($cell);
      if (~['update', 'createAndUpdate'].indexOf(this.formData.action)) {
        $cell = $('<th>').text(this.translate('Update by', 'labels', 'Import'));
        $row.append($cell);
      }
      $tbody.append($row);
      this.mapping.forEach((d, i) => {
        $row = $('<tr>');
        if (this.formData.headerRow) {
          $cell = $('<td>').text(d.name);
          $row.append($cell);
        }
        let selectedName = d.name;
        if (this.formData.attributeList) {
          if (this.formData.attributeList[i]) {
            selectedName = this.formData.attributeList[i];
          } else {
            selectedName = null;
          }
        }
        const $select = this.getFieldDropdown(i, selectedName);
        $cell = $('<td>').append($select);
        $row.append($cell);
        let value = d.value || '';
        if (value.length > 200) {
          value = value.substring(0, 200) + '...';
        }
        $cell = $('<td>').css('overflow', 'hidden').text(value);
        $row.append($cell);
        if (~['update', 'createAndUpdate'].indexOf(this.formData.action)) {
          const $checkbox = $('<input>').attr('type', 'checkbox').addClass('form-checkbox').attr('id', 'update-by-' + i.toString());

          /** @type {HTMLInputElement} */
          const checkboxElement = $checkbox.get(0);
          if (!this.formData.updateBy) {
            if (d.name === 'id') {
              checkboxElement.checked = true;
            }
          } else if (~this.formData.updateBy.indexOf(i)) {
            checkboxElement.checked = true;
          }
          $cell = $('<td>').append(checkboxElement);
          $row.append($cell);
        }
        $tbody.append($row);
      });
      $container.empty();
      $container.append($table);
      this.getDefaultFieldList().forEach(name => {
        this.addField(name);
      });
    }

    /**
     * @return {string[]}
     */
    getDefaultFieldList() {
      if (this.formData.defaultFieldList) {
        return this.formData.defaultFieldList;
      }
      if (!this.formData.defaultValues) {
        return [];
      }
      const defaultAttributes = Object.keys(this.formData.defaultValues);
      return this.getFieldManager().getEntityTypeFieldList(this.scope).filter(field => {
        const attributeList = this.getFieldManager().getEntityTypeFieldActualAttributeList(this.scope, field);
        return attributeList.findIndex(attribute => defaultAttributes.includes(attribute)) !== -1;
      });
    }
    getFieldList() {
      const defs = this.getMetadata().get('entityDefs.' + this.scope + '.fields');
      const forbiddenFieldList = this.getAcl().getScopeForbiddenFieldList(this.scope, 'edit');
      let fieldList = [];
      for (const field in defs) {
        if (~forbiddenFieldList.indexOf(field)) {
          continue;
        }
        const d = /** @type {Object.<string, *>} */defs[field];
        if (!~this.allowedFieldList.indexOf(field) && (d.disabled || d.importDisabled)) {
          continue;
        }
        fieldList.push(field);
      }
      fieldList = fieldList.sort((v1, v2) => {
        return this.translate(v1, 'fields', this.scope).localeCompare(this.translate(v2, 'fields', this.scope));
      });
      return fieldList;
    }
    getAttributeList() {
      const fields = this.getMetadata().get(['entityDefs', this.scope, 'fields']) || {};
      const forbiddenFieldList = this.getAcl().getScopeForbiddenFieldList(this.scope, 'edit');
      let attributeList = [];
      attributeList.push('id');
      for (const field in fields) {
        if (~forbiddenFieldList.indexOf(field)) {
          continue;
        }
        const d = /** @type {Object.<string, *>} */fields[field];
        if (!~this.allowedFieldList.indexOf(field) && (d.disabled && !d.importNotDisabled || d.importDisabled)) {
          continue;
        }
        if (d.type === 'phone') {
          attributeList.push(field);
          (this.getMetadata().get('entityDefs.' + this.scope + '.fields.' + field + '.typeList') || []).map(item => {
            return item.replace(/\s/g, '_');
          }).forEach(item => {
            attributeList.push(field + Espo.Utils.upperCaseFirst(item));
          });
          continue;
        }
        if (d.type === 'email') {
          attributeList.push(field + '2');
          attributeList.push(field + '3');
          attributeList.push(field + '4');
        }
        if (d.type === 'link') {
          attributeList.push(field + 'Name');
          attributeList.push(field + 'Id');
        }
        if (~['foreign'].indexOf(d.type)) {
          continue;
        }
        if (d.type === 'personName') {
          attributeList.push(field);
        }
        const type = d.type;
        let actualAttributeList = this.getFieldManager().getActualAttributeList(type, field);
        if (!actualAttributeList.length) {
          actualAttributeList = [field];
        }
        actualAttributeList.forEach(f => {
          if (attributeList.indexOf(f) === -1) {
            attributeList.push(f);
          }
        });
      }
      attributeList = attributeList.sort((v1, v2) => {
        return this.translate(v1, 'fields', this.scope).localeCompare(this.translate(v2, 'fields', this.scope));
      });
      return attributeList;
    }
    getFieldDropdown(num, name) {
      name = name || false;
      const fieldList = this.getAttributeList();
      const $select = $('<select>').addClass('form-control').attr('id', 'column-' + num.toString());
      let $option = $('<option>').val('').text('-' + this.translate('Skip', 'labels', 'Import') + '-');
      const scope = this.formData.entityType;
      $select.append($option);
      fieldList.forEach(field => {
        let label = '';
        if (this.getLanguage().has(field, 'fields', scope) || this.getLanguage().has(field, 'fields', 'Global')) {
          label = this.translate(field, 'fields', scope);
        } else {
          if (field.indexOf('Id') === field.length - 2) {
            const baseField = field.substr(0, field.length - 2);
            if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
              label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('id', 'fields') + ')';
            }
          } else if (field.indexOf('Name') === field.length - 4) {
            const baseField = field.substr(0, field.length - 4);
            if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
              label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('name', 'fields') + ')';
            }
          } else if (field.indexOf('Type') === field.length - 4) {
            const baseField = field.substr(0, field.length - 4);
            if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
              label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('type', 'fields') + ')';
            }
          } else if (field.indexOf('phoneNumber') === 0) {
            const phoneNumberType = field.substr(11);
            const phoneNumberTypeLabel = this.getLanguage().translateOption(phoneNumberType, 'phoneNumber', scope);
            label = this.translate('phoneNumber', 'fields', scope) + ' (' + phoneNumberTypeLabel + ')';
          } else if (field.indexOf('emailAddress') === 0 && parseInt(field.substr(12)).toString() === field.substr(12)) {
            const emailAddressNum = field.substr(12);
            label = this.translate('emailAddress', 'fields', scope) + ' ' + emailAddressNum.toString();
          } else if (field.indexOf('Ids') === field.length - 3) {
            const baseField = field.substr(0, field.length - 3);
            if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
              label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('ids', 'fields') + ')';
            }
          }
        }
        if (!label) {
          label = field;
        }
        $option = $('<option>').val(field).text(label);
        if (name) {
          if (field === name) {
            $option.prop('selected', true);
          } else {
            if (name.toLowerCase().replace('_', '') === field.toLowerCase()) {
              $option.prop('selected', true);
            }
          }
        }
        $select.append($option);
      });
      return $select;
    }
    addField(name) {
      this.$el.find('[data-action="addField"][data-name="' + name + '"]').parent().addClass('hidden');
      $(this.containerSelector + ' button[data-name="update"]').removeClass('disabled');
      Espo.Ui.notify(' ... ');
      let label = this.translate(name, 'fields', this.scope);
      label = this.getHelper().escapeString(label);
      const removeLink = '<a role="button" class="pull-right" data-action="removeField" data-name="' + name + '">' + '<span class="fas fa-times"></span></a>';
      const html = '<div class="cell form-group">' + removeLink + '<label class="control-label">' + label + '</label><div class="field" data-name="' + name + '"/></div>';
      $('#default-values-container').append(html);
      const type = Espo.Utils.upperCaseFirst(this.model.getFieldParam(name, 'type'));
      const viewName = this.getMetadata().get(['entityDefs', this.scope, 'fields', name, 'view']) || this.getFieldManager().getViewName(type);
      this.createView(name, viewName, {
        model: this.model,
        fullSelector: this.getSelector() + ' .field[data-name="' + name + '"]',
        defs: {
          name: name
        },
        mode: 'edit',
        readOnlyDisabled: true
      }, view => {
        this.additionalFields.push(name);
        view.render();
        view.notify(false);
      });
    }
    disableButtons() {
      this.$el.find('button[data-action="next"]').addClass('disabled').attr('disabled', 'disabled');
      this.$el.find('button[data-action="back"]').addClass('disabled').attr('disabled', 'disabled');
    }
    enableButtons() {
      this.$el.find('button[data-action="next"]').removeClass('disabled').removeAttr('disabled');
      this.$el.find('button[data-action="back"]').removeClass('disabled').removeAttr('disabled');
    }

    /**
     * @param {string} field
     * @return {module:views/fields/base}
     */
    getFieldView(field) {
      return this.getView(field);
    }
    fetch(skipValidation) {
      const attributes = {};
      this.additionalFields.forEach(field => {
        const view = this.getFieldView(field);
        _.extend(attributes, view.fetch());
      });
      this.model.set(attributes);
      let notValid = false;
      this.additionalFields.forEach(field => {
        const view = this.getFieldView(field);
        notValid = view.validate() || notValid;
      });
      if (!notValid) {
        this.formData.defaultValues = attributes;
      }
      if (notValid && !skipValidation) {
        return false;
      }
      this.formData.defaultFieldList = Espo.Utils.clone(this.additionalFields);
      const attributeList = [];
      this.mapping.forEach((d, i) => {
        attributeList.push($('#column-' + i).val());
      });
      this.formData.attributeList = attributeList;
      if (~['update', 'createAndUpdate'].indexOf(this.formData.action)) {
        const updateBy = [];
        this.mapping.forEach((d, i) => {
          if ($('#update-by-' + i).get(0).checked) {
            updateBy.push(i);
          }
        });
        this.formData.updateBy = updateBy;
      }
      this.getParentIndexView().formData = this.formData;
      this.getParentIndexView().trigger('change');
      return true;
    }

    /**
     * @return {import('./index').default}
     */
    getParentIndexView() {
      // noinspection JSValidateTypes
      return this.getParentView();
    }
    back() {
      this.fetch(true);
      this.getParentIndexView().changeStep(1);
    }
    next() {
      if (!this.fetch()) {
        return;
      }
      this.disableButtons();
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('Import/file', null, {
        timeout: 0,
        contentType: 'text/csv',
        data: this.getParentIndexView().fileContents
      }).then(result => {
        if (!result.attachmentId) {
          Espo.Ui.error(this.translate('Bad response'));
          return;
        }
        this.runImport(result.attachmentId);
      });
    }
    runImport(attachmentId) {
      this.formData.attachmentId = attachmentId;
      this.getRouter().confirmLeaveOut = false;
      Espo.Ui.notify(this.translate('importRunning', 'messages', 'Import'));
      Espo.Ajax.postRequest('Import', this.formData, {
        timeout: 0
      }).then(result => {
        const id = result.id;
        this.getParentIndexView().trigger('done');
        if (!id) {
          Espo.Ui.error(this.translate('Error'), true);
          this.enableButtons();
          return;
        }
        if (!this.formData.manualMode) {
          this.getRouter().navigate('#Import/view/' + id, {
            trigger: true
          });
          Espo.Ui.notify(false);
          return;
        }
        this.createView('dialog', 'views/modal', {
          templateContent: "{{complexText viewObject.options.msg}}",
          headerText: ' ',
          backdrop: 'static',
          msg: this.translate('commandToRun', 'strings', 'Import') + ':\n\n' + '```php command.php import --id=' + id + '```',
          buttonList: [{
            name: 'close',
            label: this.translate('Close')
          }]
        }, view => {
          view.render();
          this.listenToOnce(view, 'close', () => {
            this.getRouter().navigate('#Import/view/' + id, {
              trigger: true
            });
          });
        });
        Espo.Ui.notify(false);
      }).catch(() => this.enableButtons());
    }
  }
  var _default = Step2ImportView;
  _exports.default = _default;
});

define("views/import/step1", ["exports", "view", "model", "intl-tel-input-globals"], function (_exports, _view, _model, _intlTelInputGlobals) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _model = _interopRequireDefault(_model);
  _intlTelInputGlobals = _interopRequireDefault(_intlTelInputGlobals);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  // noinspection NpmUsedModulesInstalled

  class Step1ImportView extends _view.default {
    template = 'import/step-1';
    events = {
      /** @this Step1ImportView */
      'change #import-file': function (e) {
        const files = e.currentTarget.files;
        if (files.length) {
          this.loadFile(files[0]);
        }
      },
      /** @this Step1ImportView */
      'click button[data-action="next"]': function () {
        this.next();
      },
      /** @this Step1ImportView */
      'click button[data-action="saveAsDefault"]': function () {
        this.saveAsDefault();
      }
    };
    getEntityList() {
      const list = [];
      /** @type {Object.<string, Record>} */
      const scopes = this.getMetadata().get('scopes');
      for (const scopeName in scopes) {
        if (scopes[scopeName].importable) {
          if (!this.getAcl().checkScope(scopeName, 'create')) {
            continue;
          }
          list.push(scopeName);
        }
      }
      list.sort((v1, v2) => {
        return this.translate(v1, 'scopeNamesPlural').localeCompare(this.translate(v2, 'scopeNamesPlural'));
      });
      return list;
    }
    data() {
      return {
        entityList: this.getEntityList()
      };
    }
    setup() {
      this.attributeList = ['entityType', 'action'];
      this.paramList = ['headerRow', 'decimalMark', 'personNameFormat', 'delimiter', 'dateFormat', 'timeFormat', 'currency', 'timezone', 'textQualifier', 'silentMode', 'idleMode', 'skipDuplicateChecking', 'manualMode', 'phoneNumberCountry'];
      this.paramList.forEach(item => {
        this.attributeList.push(item);
      });
      this.formData = this.options.formData || {
        entityType: this.options.entityType || null,
        create: 'create',
        headerRow: true,
        delimiter: ',',
        textQualifier: '"',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        currency: this.getConfig().get('defaultCurrency'),
        timezone: 'UTC',
        decimalMark: '.',
        personNameFormat: 'f l',
        idleMode: false,
        skipDuplicateChecking: false,
        silentMode: true,
        manualMode: false
      };
      const defaults = Espo.Utils.cloneDeep((this.getPreferences().get('importParams') || {}).default || {});
      if (!this.options.formData) {
        for (const p in defaults) {
          this.formData[p] = defaults[p];
        }
      }
      const model = this.model = new _model.default();
      this.attributeList.forEach(a => {
        model.set(a, this.formData[a]);
      });
      this.attributeList.forEach(a => {
        this.listenTo(model, 'change:' + a, (m, v, o) => {
          if (!o.ui) {
            return;
          }
          this.formData[a] = this.model.get(a);
          this.preview();
        });
      });
      const personNameFormatList = ['f l', 'l f', 'l, f'];
      const personNameFormat = this.getConfig().get('personNameFormat') || 'firstLast';
      if (~personNameFormat.toString().toLowerCase().indexOf('middle')) {
        personNameFormatList.push('f m l');
        personNameFormatList.push('l f m');
      }
      const dateFormatDataList = this.getDateFormatDataList();
      const timeFormatDataList = this.getTimeFormatDataList();
      const dateFormatList = [];
      const dateFormatOptions = {};
      dateFormatDataList.forEach(item => {
        dateFormatList.push(item.key);
        dateFormatOptions[item.key] = item.label;
      });
      const timeFormatList = [];
      const timeFormatOptions = {};
      timeFormatDataList.forEach(item => {
        timeFormatList.push(item.key);
        timeFormatOptions[item.key] = item.label;
      });
      this.createView('actionField', 'views/fields/enum', {
        selector: '.field[data-name="action"]',
        model: this.model,
        name: 'action',
        mode: 'edit',
        params: {
          options: ['create', 'createAndUpdate', 'update'],
          translatedOptions: {
            create: this.translate('Create Only', 'labels', 'Admin'),
            createAndUpdate: this.translate('Create and Update', 'labels', 'Admin'),
            update: this.translate('Update Only', 'labels', 'Admin')
          }
        }
      });
      this.createView('entityTypeField', 'views/fields/enum', {
        selector: '.field[data-name="entityType"]',
        model: this.model,
        name: 'entityType',
        mode: 'edit',
        params: {
          options: [''].concat(this.getEntityList()),
          translation: 'Global.scopeNamesPlural',
          required: true
        },
        labelText: this.translate('Entity Type', 'labels', 'Import')
      });
      this.createView('decimalMarkField', 'views/fields/varchar', {
        selector: '.field[data-name="decimalMark"]',
        model: this.model,
        name: 'decimalMark',
        mode: 'edit',
        params: {
          options: ['.', ','],
          maxLength: 1,
          required: true
        },
        labelText: this.translate('Decimal Mark', 'labels', 'Import')
      });
      this.createView('personNameFormatField', 'views/fields/enum', {
        selector: '.field[data-name="personNameFormat"]',
        model: this.model,
        name: 'personNameFormat',
        mode: 'edit',
        params: {
          options: personNameFormatList,
          translation: 'Import.options.personNameFormat'
        }
      });
      this.createView('delimiterField', 'views/fields/enum', {
        selector: '.field[data-name="delimiter"]',
        model: this.model,
        name: 'delimiter',
        mode: 'edit',
        params: {
          options: [',', ';', '\\t', '|']
        }
      });
      this.createView('textQualifierField', 'views/fields/enum', {
        selector: '.field[data-name="textQualifier"]',
        model: this.model,
        name: 'textQualifier',
        mode: 'edit',
        params: {
          options: ['"', '\''],
          translatedOptions: {
            '"': this.translate('Double Quote', 'labels', 'Import'),
            '\'': this.translate('Single Quote', 'labels', 'Import')
          }
        }
      });
      this.createView('dateFormatField', 'views/fields/enum', {
        selector: '.field[data-name="dateFormat"]',
        model: this.model,
        name: 'dateFormat',
        mode: 'edit',
        params: {
          options: dateFormatList,
          translatedOptions: dateFormatOptions
        }
      });
      this.createView('timeFormatField', 'views/fields/enum', {
        selector: '.field[data-name="timeFormat"]',
        model: this.model,
        name: 'timeFormat',
        mode: 'edit',
        params: {
          options: timeFormatList,
          translatedOptions: timeFormatOptions
        }
      });
      this.createView('currencyField', 'views/fields/enum', {
        selector: '.field[data-name="currency"]',
        model: this.model,
        name: 'currency',
        mode: 'edit',
        params: {
          options: this.getConfig().get('currencyList')
        }
      });
      this.createView('timezoneField', 'views/fields/enum', {
        selector: '.field[data-name="timezone"]',
        model: this.model,
        name: 'timezone',
        mode: 'edit',
        params: {
          options: this.getMetadata().get(['entityDefs', 'Settings', 'fields', 'timeZone', 'options'])
        }
      });
      this.createView('headerRowField', 'views/fields/bool', {
        selector: '.field[data-name="headerRow"]',
        model: this.model,
        name: 'headerRow',
        mode: 'edit'
      });
      this.createView('silentModeField', 'views/fields/bool', {
        selector: '.field[data-name="silentMode"]',
        model: this.model,
        name: 'silentMode',
        mode: 'edit',
        tooltip: true,
        tooltipText: this.translate('silentMode', 'tooltips', 'Import')
      });
      this.createView('idleModeField', 'views/fields/bool', {
        selector: '.field[data-name="idleMode"]',
        model: this.model,
        name: 'idleMode',
        mode: 'edit'
      });
      this.createView('skipDuplicateCheckingField', 'views/fields/bool', {
        selector: '.field[data-name="skipDuplicateChecking"]',
        model: this.model,
        name: 'skipDuplicateChecking',
        mode: 'edit'
      });
      this.createView('manualModeField', 'views/fields/bool', {
        selector: '.field[data-name="manualMode"]',
        model: this.model,
        name: 'manualMode',
        mode: 'edit',
        tooltip: true,
        tooltipText: this.translate('manualMode', 'tooltips', 'Import')
      });
      this.createView('phoneNumberCountryField', 'views/fields/enum', {
        selector: '.field[data-name="phoneNumberCountry"]',
        model: this.model,
        name: 'phoneNumberCountry',
        mode: 'edit',
        params: {
          options: ['', ..._intlTelInputGlobals.default.getCountryData().map(item => item.iso2)]
        },
        translatedOptions: _intlTelInputGlobals.default.getCountryData().reduce((map, item) => {
          map[item.iso2] = `${item.iso2.toUpperCase()} +${item.dialCode}`;
          return map;
        }, {})
      });
      this.listenTo(this.model, 'change', (m, o) => {
        if (!o.ui) {
          return;
        }
        let isParamChanged = false;
        this.paramList.forEach(a => {
          if (m.hasChanged(a)) {
            isParamChanged = true;
          }
        });
        if (isParamChanged) {
          this.showSaveAsDefaultButton();
        }
      });
      this.listenTo(this.model, 'change', () => {
        if (this.isRendered()) {
          this.controlFieldVisibility();
        }
      });
      this.listenTo(this.model, 'change:entityType', () => {
        delete this.formData.defaultFieldList;
        delete this.formData.defaultValues;
        delete this.formData.attributeList;
        delete this.formData.updateBy;
      });
      this.listenTo(this.model, 'change:action', () => {
        delete this.formData.updateBy;
      });
      this.listenTo(this.model, 'change', (m, o) => {
        if (!o.ui) {
          return;
        }
        this.getRouter().confirmLeaveOut = true;
      });
    }
    afterRender() {
      this.setupFormData();
      if (this.getParentIndexView() && this.getParentIndexView().fileContents) {
        this.setFileIsLoaded();
        this.preview();
      }
      this.controlFieldVisibility();
    }

    /**
     * @return {import('./index').default}
     */
    getParentIndexView() {
      // noinspection JSValidateTypes
      return this.getParentView();
    }
    showSaveAsDefaultButton() {
      this.$el.find('[data-action="saveAsDefault"]').removeClass('hidden');
    }
    hideSaveAsDefaultButton() {
      this.$el.find('[data-action="saveAsDefault"]').addClass('hidden');
    }

    /**
     * @return {module:views/fields/base}
     */
    getFieldView(field) {
      return this.getView(field + 'Field');
    }
    next() {
      this.attributeList.forEach(field => {
        this.getFieldView(field).fetchToModel();
        this.formData[field] = this.model.get(field);
      });
      let isInvalid = false;
      this.attributeList.forEach(field => {
        isInvalid |= this.getFieldView(field).validate();
      });
      if (isInvalid) {
        Espo.Ui.error(this.translate('Not valid'));
        return;
      }
      this.getParentIndexView().formData = this.formData;
      this.getParentIndexView().trigger('change');
      this.getParentIndexView().changeStep(2);
    }
    setupFormData() {
      this.attributeList.forEach(field => {
        this.model.set(field, this.formData[field]);
      });
    }

    /**
     * @param {File} file
     */
    loadFile(file) {
      const blob = file.slice(0, 1024 * 16);
      const readerPreview = new FileReader();
      readerPreview.onloadend = e => {
        if (e.target.readyState === FileReader.DONE) {
          this.formData.previewString = e.target.result;
          this.preview();
        }
      };
      readerPreview.readAsText(blob);
      const reader = new FileReader();
      reader.onloadend = e => {
        if (e.target.readyState === FileReader.DONE) {
          this.getParentIndexView().fileContents = e.target.result;
          this.setFileIsLoaded();
          this.getRouter().confirmLeaveOut = true;
          this.setFileName(file.name);
        }
      };
      reader.readAsText(file);
    }

    /**
     * @param {string} name
     */
    setFileName(name) {
      this.$el.find('.import-file-name').text(name);
      this.$el.find('.import-file-info').text('');
    }
    setFileIsLoaded() {
      this.$el.find('button[data-action="next"]').removeClass('hidden');
    }
    preview() {
      if (!this.formData.previewString) {
        return;
      }
      const arr = this.csvToArray(this.formData.previewString, this.formData.delimiter, this.formData.textQualifier);
      this.formData.previewArray = arr;
      const $table = $('<table>').addClass('table').addClass('table-bordered');
      const $tbody = $('<tbody>').appendTo($table);
      arr.forEach((row, i) => {
        if (i >= 3) {
          return;
        }
        const $row = $('<tr>');
        row.forEach(value => {
          const $cell = $('<td>').html(this.getHelper().sanitizeHtml(value));
          $row.append($cell);
        });
        $tbody.append($row);
      });
      const $container = $('#import-preview');
      $container.empty().append($table);
    }
    csvToArray(strData, strDelimiter, strQualifier) {
      strDelimiter = strDelimiter || ',';
      strQualifier = strQualifier || '\"';
      strDelimiter = strDelimiter.replace(/\\t/, '\t');
      const objPattern = new RegExp(
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      "(?:" + strQualifier + "([^" + strQualifier + "]*(?:" + strQualifier + "" + strQualifier + "[^" + strQualifier + "]*)*)" + strQualifier + "|" +
      // Standard fields.
      "([^" + strQualifier + "\\" + strDelimiter + "\\r\\n]*))", "gi");
      const arrData = [[]];
      let arrMatches = null;
      while (arrMatches = objPattern.exec(strData)) {
        const strMatchedDelimiter = arrMatches[1];
        let strMatchedValue;
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
          arrData.push([]);
        }
        strMatchedValue = arrMatches[2] ? arrMatches[2].replace(new RegExp("\"\"", "g"), "\"") : arrMatches[3];
        arrData[arrData.length - 1].push(strMatchedValue);
      }
      return arrData;
    }
    saveAsDefault() {
      const preferences = this.getPreferences();
      const importParams = Espo.Utils.cloneDeep(preferences.get('importParams') || {});
      const data = {};
      this.paramList.forEach(attribute => {
        data[attribute] = this.model.get(attribute);
      });
      importParams.default = data;
      preferences.save({
        importParams: importParams
      }).then(() => {
        Espo.Ui.success(this.translate('Saved'));
      });
      this.hideSaveAsDefaultButton();
    }
    controlFieldVisibility() {
      if (this.model.get('idleMode')) {
        this.hideField('manualMode');
      } else {
        this.showField('manualMode');
      }
      if (this.model.get('manualMode')) {
        this.hideField('idleMode');
      } else {
        this.showField('idleMode');
      }
    }
    hideField(name) {
      this.$el.find('.field[data-name="' + name + '"]').parent().addClass('hidden-cell');
    }
    showField(name) {
      this.$el.find('.field[data-name="' + name + '"]').parent().removeClass('hidden-cell');
    }
    convertFormatToLabel(format) {
      const formatItemLabelMap = {
        'YYYY': '2021',
        'DD': '27',
        'MM': '12',
        'HH': '23',
        'mm': '00',
        'hh': '11',
        'ss': '00',
        'a': 'pm',
        'A': 'PM'
      };
      let label = format;
      for (const item in formatItemLabelMap) {
        const value = formatItemLabelMap[item];
        label = label.replace(new RegExp(item, 'g'), value);
      }
      return format + ' - ' + label;
    }
    getDateFormatDataList() {
      const dateFormatList = this.getMetadata().get(['clientDefs', 'Import', 'dateFormatList']) || [];
      return dateFormatList.map(item => {
        return {
          key: item,
          label: this.convertFormatToLabel(item)
        };
      });
    }
    getTimeFormatDataList() {
      const timeFormatList = this.getMetadata().get(['clientDefs', 'Import', 'timeFormatList']) || [];
      return timeFormatList.map(item => {
        return {
          key: item,
          label: this.convertFormatToLabel(item)
        };
      });
    }
  }
  var _default = Step1ImportView;
  _exports.default = _default;
});

define("views/import/list", ["exports", "views/list"], function (_exports, _list) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _list = _interopRequireDefault(_list);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportListView extends _list.default {
    createButton = false;
    setup() {
      super.setup();
      this.menu.buttons.unshift({
        iconHtml: '<span class="fas fa-plus fa-sm"></span>',
        text: this.translate('New Import', 'labels', 'Import'),
        link: '#Import',
        acl: 'edit'
      });
    }
  }
  var _default = ImportListView;
  _exports.default = _default;
});

define("views/import/index", ["exports", "view"], function (_exports, _view) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/import/index */

  class IndexImportView extends _view.default {
    template = 'import/index';
    formData = null;
    fileContents = null;
    data() {
      return {
        fromAdmin: this.options.fromAdmin
      };
    }
    setup() {
      this.entityType = this.options.entityType || null;
      this.startFromStep = 1;
      if (this.options.formData || this.options.fileContents) {
        this.formData = this.options.formData || {};
        this.fileContents = this.options.fileContents || null;
        this.entityType = this.formData.entityType || null;
        if (this.options.step) {
          this.startFromStep = this.options.step;
        }
      }
    }
    changeStep(num, result) {
      this.step = num;
      if (num > 1) {
        this.setConfirmLeaveOut(true);
      }
      this.createView('step', 'views/import/step' + num.toString(), {
        selector: '> .import-container',
        entityType: this.entityType,
        formData: this.formData,
        result: result
      }, view => {
        view.render();
      });
      let url = '#Import';
      if (this.options.fromAdmin) {
        url = '#Admin/import';
      }
      if (this.step > 1) {
        url += '/index/step=' + this.step;
      }
      this.getRouter().navigate(url, {
        trigger: false
      });
    }
    afterRender() {
      this.changeStep(this.startFromStep);
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Import', 'labels', 'Admin'));
    }
    setConfirmLeaveOut(value) {
      this.getRouter().confirmLeaveOut = value;
    }
  }
  var _default = IndexImportView;
  _exports.default = _default;
});

define("views/import/detail", ["exports", "views/detail"], function (_exports, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportDetailView extends _detail.default {
    getHeader() {
      let name = this.getDateTime().toDisplay(this.model.get('createdAt'));
      return this.buildHeaderHtml([$('<a>').attr('href', '#' + this.model.entityType + '/list').text(this.getLanguage().translate(this.model.entityType, 'scopeNamesPlural')), $('<span>').text(name)]);
    }
    setup() {
      super.setup();
      this.setupMenu();
      this.listenTo(this.model, 'change', () => {
        this.setupMenu();
        if (this.isRendered()) {
          this.getView('header').reRender();
        }
      });
      this.listenTo(this.model, 'sync', m => {
        this.controlButtons(m);
      });
    }
    setupMenu() {
      this.addMenuItem('buttons', {
        label: "Remove Import Log",
        action: "removeImportLog",
        name: 'removeImportLog',
        style: "default",
        acl: "delete",
        title: this.translate('removeImportLog', 'messages', 'Import')
      }, true);
      this.addMenuItem('buttons', {
        label: "Revert Import",
        name: 'revert',
        action: "revert",
        style: "danger",
        acl: "edit",
        title: this.translate('revert', 'messages', 'Import'),
        hidden: !this.model.get('importedCount')
      }, true);
      this.addMenuItem('buttons', {
        label: "Remove Duplicates",
        name: 'removeDuplicates',
        action: "removeDuplicates",
        style: "default",
        acl: "edit",
        title: this.translate('removeDuplicates', 'messages', 'Import'),
        hidden: !this.model.get('duplicateCount')
      }, true);
      this.addMenuItem('dropdown', {
        label: 'New import with same params',
        name: 'createWithSameParams',
        action: 'createWithSameParams'
      });
    }
    controlButtons(model) {
      if (!model || model.hasChanged('importedCount')) {
        if (this.model.get('importedCount')) {
          this.showHeaderActionItem('revert');
        } else {
          this.hideHeaderActionItem('revert');
        }
      }
      if (!model || model.hasChanged('duplicateCount')) {
        if (this.model.get('duplicateCount')) {
          this.showHeaderActionItem('removeDuplicates');
        } else {
          this.hideHeaderActionItem('removeDuplicates');
        }
      }
    }

    // noinspection JSUnusedGlobalSymbols
    actionRemoveImportLog() {
      this.confirm(this.translate('confirmRemoveImportLog', 'messages', 'Import'), () => {
        this.disableMenuItem('removeImportLog');
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        this.model.destroy({
          wait: true
        }).then(() => {
          Espo.Ui.notify(false);
          var collection = this.model.collection;
          if (collection) {
            if (collection.total > 0) {
              collection.total--;
            }
          }
          this.getRouter().navigate('#Import/list', {
            trigger: true
          });
          this.removeMenuItem('removeImportLog', true);
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionRevert() {
      this.confirm(this.translate('confirmRevert', 'messages', 'Import'), () => {
        this.disableMenuItem('revert');
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        Espo.Ajax.postRequest(`Import/${this.model.id}/revert`).then(() => {
          this.getRouter().navigate('#Import/list', {
            trigger: true
          });
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionRemoveDuplicates() {
      this.confirm(this.translate('confirmRemoveDuplicates', 'messages', 'Import'), () => {
        this.disableMenuItem('removeDuplicates');
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
        Espo.Ajax.postRequest(`Import/${this.model.id}/removeDuplicates`).then(() => {
          this.removeMenuItem('removeDuplicates', true);
          this.model.fetch();
          this.model.trigger('update-all');
          Espo.Ui.success(this.translate('duplicatesRemoved', 'messages', 'Import'));
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateWithSameParams() {
      let formData = this.model.get('params') || {};
      formData.entityType = this.model.get('entityType');
      formData.attributeList = this.model.get('attributeList') || [];
      formData = Espo.Utils.cloneDeep(formData);
      this.getRouter().navigate('#Import', {
        trigger: false
      });
      this.getRouter().dispatch('Import', 'index', {
        formData: formData
      });
    }
  }
  var _default = ImportDetailView;
  _exports.default = _default;
});

define("views/import/record/list", ["exports", "views/record/list"], function (_exports, _list) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _list = _interopRequireDefault(_list);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportListRecordView extends _list.default {
    quickDetailDisabled = true;
    quickEditDisabled = true;
    checkAllResultDisabled = true;
    massActionList = ['remove'];
    rowActionsView = 'views/record/row-actions/remove-only';
  }
  var _default = ImportListRecordView;
  _exports.default = _default;
});

define("views/import/record/detail", ["exports", "views/record/detail"], function (_exports, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportDetailRecordView extends _detail.default {
    readOnly = true;
    returnUrl = '#Import/list';
    checkInterval = 5;
    resultPanelFetchLimit = 10;
    duplicateAction = false;
    setup() {
      super.setup();
      this.fetchCounter = 0;
      this.setupChecking();
      this.hideActionItem('delete');
    }
    setupChecking() {
      if (!this.model.has('status')) {
        this.listenToOnce(this.model, 'sync', this.setupChecking.bind(this));
        return;
      }
      if (!~['In Process', 'Pending', 'Standby'].indexOf(this.model.get('status'))) {
        return;
      }
      setTimeout(this.runChecking.bind(this), this.checkInterval * 1000);
      this.on('remove', () => {
        this.stopChecking = true;
      });
    }
    runChecking() {
      if (this.stopChecking) {
        return;
      }
      this.model.fetch().then(() => {
        const isFinished = !~['In Process', 'Pending', 'Standby'].indexOf(this.model.get('status'));
        if (this.fetchCounter < this.resultPanelFetchLimit && !isFinished) {
          this.fetchResultPanels();
        }
        if (isFinished) {
          this.fetchResultPanels();
          return;
        }
        setTimeout(this.runChecking.bind(this), this.checkInterval * 1000);
      });
      this.fetchCounter++;
    }
    fetchResultPanels() {
      const bottomView = this.getView('bottom');
      if (!bottomView) {
        return;
      }
      const importedView = bottomView.getView('imported');
      if (importedView && importedView.collection) {
        importedView.collection.fetch();
      }
      const duplicatesView = bottomView.getView('duplicates');
      if (duplicatesView && duplicatesView.collection) {
        duplicatesView.collection.fetch();
      }
      const updatedView = bottomView.getView('updated');
      if (updatedView && updatedView.collection) {
        updatedView.collection.fetch();
      }
    }
  }
  var _default = ImportDetailRecordView;
  _exports.default = _default;
});

define("views/import/record/row-actions/duplicates", ["exports", "views/record/row-actions/default"], function (_exports, _default2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _default2 = _interopRequireDefault(_default2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportDuplicatesRowActionsView extends _default2.default {
    getActionList() {
      const list = super.getActionList();
      list.push({
        action: 'unmarkAsDuplicate',
        label: 'Set as Not Duplicate',
        data: {
          id: this.model.id,
          type: this.model.entityType
        }
      });
      return list;
    }
  }
  var _default = ImportDuplicatesRowActionsView;
  _exports.default = _default;
});

define("views/import/record/panels/updated", ["exports", "views/import/record/panels/imported"], function (_exports, _imported) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _imported = _interopRequireDefault(_imported);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportUpdatedPanelView extends _imported.default {
    link = 'updated';
    rowActionsView = 'views/record/row-actions/relationship-view-and-edit';
    setup() {
      this.title = this.title || this.translate('Updated', 'labels', 'Import');
      super.setup();
    }
  }
  var _default = ImportUpdatedPanelView;
  _exports.default = _default;
});

define("views/import/record/panels/duplicates", ["exports", "views/import/record/panels/imported"], function (_exports, _imported) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _imported = _interopRequireDefault(_imported);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportDuplicatesPanelView extends _imported.default {
    link = 'duplicates';
    setup() {
      this.title = this.title || this.translate('Duplicates', 'labels', 'Import');
      super.setup();
    }

    // noinspection JSUnusedGlobalSymbols
    actionUnmarkAsDuplicate(data) {
      const id = data.id;
      const type = data.type;
      this.confirm(this.translate('confirmation', 'messages'), () => {
        Espo.Ajax.postRequest(`Import/${this.model.id}/unmarkDuplicates`, {
          entityId: id,
          entityType: type
        }).then(() => {
          this.collection.fetch();
        });
      });
    }
  }
  var _default = ImportDuplicatesPanelView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/group-email-folder/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/email-folder/record/row-actions/default',

        actionMoveUp: function (data) {
            let model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            let index = this.collection.indexOf(model);

            if (index === 0) {
                return;
            }

            Espo.Ajax.postRequest('GroupEmailFolder/action/moveUp', {id: model.id})
                .then(() => {
                    this.collection.fetch();
                });
        },

        actionMoveDown: function (data) {
            let model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            let index = this.collection.indexOf(model);

            if ((index === this.collection.length - 1) && (this.collection.length === this.collection.total)) {
                return;
            }

            Espo.Ajax.postRequest('GroupEmailFolder/action/moveDown', {id: model.id})
                .then(() => {
                    this.collection.fetch();
                });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        getActionList: function () {
            var list = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit) {
                list.unshift({
                    action: 'moveDown',
                    label: 'Move Down',
                    data: {
                        id: this.model.id,
                    },
                });

                list.unshift({
                    action: 'moveUp',
                    label: 'Move Up',
                    data: {
                        id: this.model.id,
                    },
                });
            }

            return list;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/external-account/oauth2', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'external-account/oauth2',

        data: function () {
            return {
                integration: this.integration,
                helpText: this.helpText,
                isConnected: this.isConnected,
            };
        },

        isConnected: false,

        events: {
            'click button[data-action="cancel"]': function () {
                this.getRouter().navigate('#ExternalAccount', {trigger: true});
            },
            'click button[data-action="save"]': function () {
                this.save();
            },
            'click [data-action="connect"]': function () {
                this.connect();
            }
        },

        setup: function () {
            this.integration = this.options.integration;
            this.id = this.options.id;

            this.helpText = false;

            if (this.getLanguage().has(this.integration, 'help', 'ExternalAccount')) {
                this.helpText = this.translate(this.integration, 'help', 'ExternalAccount');
            }

            this.fieldList = [];

            this.dataFieldList = [];

            this.model = new Model();
            this.model.id = this.id;
            this.model.entityType = this.model.name = 'ExternalAccount';
            this.model.urlRoot = 'ExternalAccount';

            this.model.defs = {
                fields: {
                    enabled: {
                        required: true,
                        type: 'bool'
                    },
                }
            };

            this.wait(true);

            this.model.populateDefaults();

            this.listenToOnce(this.model, 'sync', () => {
                this.createFieldView('bool', 'enabled');

                Espo.Ajax.getRequest('ExternalAccount/action/getOAuth2Info?id=' + this.id)
                    .then(response => {
                        this.clientId = response.clientId;
                        this.redirectUri = response.redirectUri;

                        if (response.isConnected) {
                            this.isConnected = true;
                        }

                        this.wait(false);
                    });
            });

            this.model.fetch();
        },

        hideField: function (name) {
            this.$el.find('label[data-name="'+name+'"]').addClass('hide');
            this.$el.find('div.field[data-name="'+name+'"]').addClass('hide');

            var view = this.getView(name);

            if (view) {
                view.disabled = true;
            }
        },

        showField: function (name) {
            this.$el.find('label[data-name="'+name+'"]').removeClass('hide');
            this.$el.find('div.field[data-name="'+name+'"]').removeClass('hide');

            var view = this.getView(name);

            if (view) {
                view.disabled = false;
            }
        },

        afterRender: function () {
            if (!this.model.get('enabled')) {
                this.$el.find('.data-panel').addClass('hidden');
            }

            this.listenTo(this.model, 'change:enabled', () => {
                if (this.model.get('enabled')) {
                    this.$el.find('.data-panel').removeClass('hidden');
                } else {
                    this.$el.find('.data-panel').addClass('hidden');
                }
            });
        },

        createFieldView: function (type, name, readOnly, params) {
            this.createView(name, this.getFieldManager().getViewName(type), {
                model: this.model,
                selector: '.field[data-name="' + name + '"]',
                defs: {
                    name: name,
                    params: params
                },
                mode: readOnly ? 'detail' : 'edit',
                readOnly: readOnly,
            });

            this.fieldList.push(name);
        },

        save: function () {
            this.fieldList.forEach(field => {
                var view = this.getView(field);

                if (!view.readOnly) {
                    view.fetchToModel();
                }
            });

            var notValid = false;

            this.fieldList.forEach((field) => {
                notValid = this.getView(field).validate() || notValid;
            });

            if (notValid) {
                this.notify('Not valid', 'error');
                return;
            }

            this.listenToOnce(this.model, 'sync', () => {
                this.notify('Saved', 'success');

                if (!this.model.get('enabled')) {
                    this.setNotConnected();
                }
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            this.model.save();
        },

        popup: function (options, callback) {
            options.windowName = options.windowName ||  'ConnectWithOAuth';
            options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
            options.callback = options.callback || function(){ window.location.reload(); };

            var self = this;

            var path = options.path;

            var arr = [];
            var params = (options.params || {});

            for (var name in params) {
                if (params[name]) {
                    arr.push(name + '=' + encodeURI(params[name]));
                }
            }
            path += '?' + arr.join('&');

            var parseUrl = function (str) {
                var code = null;
                var error = null;

                str = str.substr(str.indexOf('?') + 1, str.length);

                str.split('&').forEach((part) => {
                    var arr = part.split('=');
                    var name = decodeURI(arr[0]);
                    var value = decodeURI(arr[1] || '');

                    if (name === 'code') {
                        code = value;
                    }

                    if (name === 'error') {
                        error = value;
                    }
                });

                if (code) {
                    return {
                        code: code,
                    };
                } else if (error) {
                    return {
                        error: error,
                    };
                }
            }

            let popup = window.open(path, options.windowName, options.windowOptions);

            let interval;

            interval = window.setInterval(() => {
                if (popup.closed) {
                    window.clearInterval(interval);
                } else {
                    var res = parseUrl(popup.location.href.toString());

                    if (res) {
                        callback.call(self, res);
                        popup.close();
                        window.clearInterval(interval);
                    }
                }
            }, 500);
        },

        connect: function () {
            this.popup({
                path: this.getMetadata().get('integrations.' + this.integration + '.params.endpoint'),
                params: {
                    client_id: this.clientId,
                    redirect_uri: this.redirectUri,
                    scope: this.getMetadata().get('integrations.' + this.integration + '.params.scope'),
                    response_type: 'code',
                    access_type: 'offline',
                    approval_prompt: 'force',
                }
            }, function (res) {
                if (res.error) {
                    Espo.Ui.notify(false);

                    return;
                }

                if (res.code) {
                    this.$el.find('[data-action="connect"]').addClass('disabled');

                    Espo.Ajax
                        .postRequest('ExternalAccount/action/authorizationCode', {
                            id: this.id,
                            code: res.code,
                        })
                        .then(response => {
                            Espo.Ui.notify(false);

                            if (response === true) {
                                this.setConnected();
                            } else {
                                this.setNotConneted();
                            }

                            this.$el.find('[data-action="connect"]').removeClass('disabled');
                        })
                        .catch(() => {
                            this.$el.find('[data-action="connect"]').removeClass('disabled');
                        });
                } else {
                    this.notify('Error occurred', 'error');
                }
            });
        },

        setConnected: function () {
            this.isConnected = true;

            this.$el.find('[data-action="connect"]').addClass('hidden');;
            this.$el.find('.connected-label').removeClass('hidden');
        },

        setNotConnected: function () {
            this.isConnected = false;

            this.$el.find('[data-action="connect"]').removeClass('hidden');;
            this.$el.find('.connected-label').addClass('hidden');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/external-account/index', ['view'], function (Dep) {

    return Dep.extend({

        template: 'external-account/index',

        data: function () {
            return {
                externalAccountList: this.externalAccountList,
                id: this.id,
                externalAccountListCount: this.externalAccountList.length
            };
        },

        events: {
            'click #external-account-menu a.external-account-link': function (e) {
                var id = $(e.currentTarget).data('id') + '__' + this.userId;
                this.openExternalAccount(id);
            },
        },

        setup: function () {
            this.externalAccountList = this.collection.models.map(model => model.getClonedAttributes());

            this.userId = this.getUser().id;
            this.id = this.options.id || null;

            if (this.id) {
                this.userId = this.id.split('__')[1];
            }

            this.on('after:render', function () {
                this.renderHeader();

                if (!this.id) {
                    this.renderDefaultPage();
                } else {
                    this.openExternalAccount(this.id);
                }
            });
        },

        openExternalAccount: function (id) {
            this.id = id;

            var integration = this.integration = id.split('__')[0];
            this.userId = id.split('__')[1];

            this.getRouter().navigate('#ExternalAccount/edit/' + id, {trigger: false});

            var authMethod = this.getMetadata().get(['integrations', integration, 'authMethod']);

            var viewName =
                    this.getMetadata().get(['integrations', integration, 'userView']) ||
                    'views/external-account/' + Espo.Utils.camelCaseToHyphen(authMethod);

            Espo.Ui.notify(' ... ');

            this.createView('content', viewName, {
                fullSelector: '#external-account-content',
                id: id,
                integration: integration
            }, view => {
                this.renderHeader();
                view.render();
                Espo.Ui.notify(false);

                $(window).scrollTop(0);
            });
        },

        renderDefaultPage: function () {
            $('#external-account-header').html('').hide();
            $('#external-account-content').html('');
        },

        renderHeader: function () {
            if (!this.id) {
                $('#external-account-header').html('');
                return;
            }

            $('#external-account-header').show().html(this.integration);
        },

        updatePageTitle: function () {
            this.setPageTitle(this.translate('ExternalAccount', 'scopeNamesPlural'));
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/extension/record/row-actions', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            if (!this.options.acl.edit) {
                return [];
            }

            if (this.model.get('isInstalled')) {
                return [
                    {
                        action: 'uninstall',
                        label: 'Uninstall',
                        data: {
                            id: this.model.id,
                        },
                    },
                ];
            }

            return [
                {
                    action: 'install',
                    label: 'Install',
                    data: {
                        id: this.model.id,
                    },
                },
                {
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                    },
                },
            ];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/extension/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/extension/record/row-actions',

        checkboxes: false,

    	quickDetailDisabled: true,

        quickEditDisabled: true,

        massActionList: [],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/export/record/record', ['views/record/edit-for-modal'], function (Dep) {

    /**
     * @class
     * @name Class
     * @memberOf module:views/export/record/record
     * @extends module:views/record/edit-for-modal
     */
    return Dep.extend(/** @lends module:views/export/record/record.Class# */{

        /**
         * @type {string[]},
         */
        formatList: null,

        /**
         * @type {Object.<string, string[]>},
         */
        customParams: null,

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        setupBeforeFinal: function () {
            this.formatList = this.options.formatList;
            this.scope = this.options.scope;

            let fieldsData = this.getExportFieldsData();

            this.setupExportFieldDefs(fieldsData);
            this.setupExportLayout(fieldsData);
            this.setupExportDynamicLogic();

            this.controlFormatField();
            this.listenTo(this.model, 'change:format', () => this.controlFormatField());

            this.controlAllFields();
            this.listenTo(this.model, 'change:exportAllFields', () => this.controlAllFields());

            Dep.prototype.setupBeforeFinal.call(this);
        },

        setupExportFieldDefs: function (fieldsData) {
            let fieldDefs = {
                format: {
                    type: 'enum',
                    options: this.formatList,
                },
                fieldList: {
                    type: 'multiEnum',
                    options: fieldsData.list,
                    required: true,
                },
                exportAllFields: {
                    type: 'bool',
                },
            };

            this.customParams = {};

            this.formatList.forEach(format => {
                let fields = this.getFormatParamsDefs(format).fields || {};

                this.customParams[format] = [];

                for (let name in fields) {
                    let newName = this.modifyParamName(format, name);

                    this.customParams[format].push(name);

                    fieldDefs[newName] = Espo.Utils.cloneDeep(fields[name]);
                }
            });

            this.model.setDefs({fields: fieldDefs});
        },

        setupExportLayout: function (fieldsData) {
            this.detailLayout = [];

            let mainPanel = {
                rows: [
                    [
                        {name: 'format'},
                        false
                    ],
                    [
                        {name: 'exportAllFields'},
                        false
                    ],
                    [
                        {
                            name: 'fieldList',
                            options: {
                                translatedOptions: fieldsData.translations,
                            },
                        }
                    ],
                ]
            };

            this.detailLayout.push(mainPanel);

            this.formatList.forEach(format => {
                let rows = this.getFormatParamsDefs(format).layout || [];

                rows.forEach(row => {
                    row.forEach(item => {
                        item.name = this.modifyParamName(format, item.name);
                    });
                })

                this.detailLayout.push({
                    name: format,
                    rows: rows,
                })
            });
        },

        setupExportDynamicLogic: function () {
            this.dynamicLogicDefs = {
                fields: {},
            };

            this.formatList.forEach(format => {
                let defs = this.getFormatParamsDefs(format).dynamicLogic || {};

                this.customParams[format].forEach(param => {
                    let logic = defs[param] || {};

                    if (!logic.visible) {
                        logic.visible = {};
                    }

                    if (!logic.visible.conditionGroup) {
                        logic.visible.conditionGroup = [];
                    }

                    logic.visible.conditionGroup.push({
                        type: 'equals',
                        attribute: 'format',
                        value: format,
                    });

                    let newName = this.modifyParamName(format, param);

                    this.dynamicLogicDefs.fields[newName] = logic;
                });
            });
        },

        /**
         * @param {string} format
         * @return {string[]}
         */
        getFormatParamList: function (format) {
            return Object.keys(this.getFormatParamsDefs(format).fields || {});
        },

        /**
         * @private
         * @return {Object.<string, *>}
         */
        getFormatParamsDefs: function (format) {
            let defs = this.getMetadata().get(['app', 'export', 'formatDefs', format]) || {};

            return Espo.Utils.cloneDeep(defs.params || {});
        },

        /**
         * @param {string} format
         * @param {string} name
         * @return {string}
         */
        modifyParamName: function (format, name) {
            return format + Espo.Utils.upperCaseFirst(name);
        },

        /**
         * @return {{
         *   translations: Object.<string, string>,
         *   list: string[]
         * }}
         */
        getExportFieldsData: function () {
            let fieldList = this.getFieldManager().getEntityTypeFieldList(this.scope);
            let forbiddenFieldList = this.getAcl().getScopeForbiddenFieldList(this.scope);

            fieldList = fieldList.filter(item => {
                return !~forbiddenFieldList.indexOf(item);
            });

            fieldList = fieldList.filter(item => {
                let defs = this.getMetadata().get(['entityDefs', this.scope, 'fields', item]) || {};

                if (
                    defs.disabled ||
                    defs.exportDisabled ||
                    defs.type === 'map'
                ) {
                    return false
                }

                return true;
            });

            this.getLanguage().sortFieldList(this.scope, fieldList);

            fieldList.unshift('id');

            let fieldListTranslations = {};

            fieldList.forEach(item => {
                fieldListTranslations[item] = this.getLanguage().translate(item, 'fields', this.scope);
            });

            let setFieldList = this.model.get('fieldList') || [];

            setFieldList.forEach(item => {
                if (~fieldList.indexOf(item)) {
                    return;
                }

                if (!~item.indexOf('_')) {
                    return;
                }

                let arr = item.split('_');

                fieldList.push(item);

                let foreignScope = this.getMetadata().get(['entityDefs', this.scope, 'links', arr[0], 'entity']);

                if (!foreignScope) {
                    return;
                }

                fieldListTranslations[item] = this.getLanguage().translate(arr[0], 'links', this.scope) + '.' +
                    this.getLanguage().translate(arr[1], 'fields', foreignScope);
            });

            return {
                list: fieldList,
                translations: fieldListTranslations,
            };
        },

        controlAllFields: function () {
            if (!this.model.get('exportAllFields')) {
                this.showField('fieldList');

                return;
            }

            this.hideField('fieldList');
        },

        controlFormatField: function () {
            let format = this.model.get('format');

            this.formatList
                .filter(item => item !== format)
                .forEach(format => {
                    this.hidePanel(format);
                });

            this.formatList
                .filter(item => item === format)
                .forEach(format => {
                    this.customParams[format].length ?
                        this.showPanel(format) :
                        this.hidePanel(format);
                });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/export/modals/idle', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        className: 'dialog dialog-record',

        template: 'export/modals/idle',

        checkInterval: 4000,

        data: function () {
            return {
                infoText: this.translate('infoText', 'messages', 'Export'),
            };
        },

        events: {
            'click [data-action="download"]': function () {
                this.actionDownload();
            },
        },

        setup: function () {
            this.action = this.options.action;
            this.id = this.options.id;
            this.status = 'Pending';

            this.headerText = this.translate('Export');

            this.model = new Model();
            this.model.name = 'Export';

            this.model.setDefs({
                fields: {
                    'status': {
                        type: 'enum',
                        readOnly: true,
                        options: [
                            'Pending',
                            'Running',
                            'Success',
                            'Failed',
                        ],
                        style: {
                            'Success': 'success',
                            'Failed': 'danger',
                        },
                    },
                    'attachmentId': {
                        type: 'varchar',
                    },
                }
            });

            this.model.set({
                status: this.status,
                processedCount: null,
            });

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'None',
                model: this.model,
                selector: '.record',
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'status',
                                    labelText: this.translate('status', 'fields', 'Export'),
                                }
                            ]
                        ]
                    }
                ],
            });

            this.on('close', () => {
                let status = this.model.get('status');

                if (
                    status !== 'Pending' &&
                    status !== 'Running'
                ) {
                    return;
                }

                Espo.Ajax.postRequest(`Export/${this.id}/subscribe`);
            });

            this.checkStatus();
        },

        checkStatus: function () {
            Espo.Ajax
                .getRequest(`Export/${this.id}/status`)
                .then(response => {
                    let status = response.status;

                    this.model.set('status', status);

                    if (status === 'Pending' || status === 'Running') {
                        setTimeout(() => this.checkStatus(), this.checkInterval);

                        return;
                    }

                    this.model.set({
                        attachmentId: response.attachmentId,
                    });

                    if (status === 'Success') {
                        this.trigger('success', {
                            attachmentId: response.attachmentId,
                        });

                        this.showDownload();
                    }

                    if (this.$el) {
                        this.$el.find('.info-text').addClass('hidden');
                    }
                });
        },

        showDownload: function () {
            this.$el.find('.download-container').removeClass('hidden');

            let $download = this.$el.find('[data-action="download"]');

            $download.removeClass('hidden');
        },

        actionDownload: function () {
            this.trigger('download', this.model.get('attachmentId'));

            this.close();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/export/modals/export', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        cssName: 'export-modal',

        className: 'dialog dialog-record',

        template: 'export/modals/export',

        shortcutKeys: {
            'Control+Enter': 'export',
        },

        data: function () {
            return {};
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'export',
                    label: 'Export',
                    style: 'danger',
                    title: 'Ctrl+Enter',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                }
            ];

            this.model = new Model();
            this.model.name = 'Export';

            this.scope = this.options.scope;

            if (this.options.fieldList) {
                const fieldList = this.options.fieldList
                    .filter(field => {
                        return !this.getMetadata()
                            .get(`entityDefs.${this.scope}.fields.${field}.exportDisabled`);
                    });

                this.model.set('fieldList', fieldList);
                this.model.set('exportAllFields', false);
            } else {
                this.model.set('exportAllFields', true);
            }

            let formatList =
                this.getMetadata().get(['scopes', this.scope, 'exportFormatList']) ||
                this.getMetadata().get('app.export.formatList');

            this.model.set('format', formatList[0]);

            this.createView('record', 'views/export/record/record', {
                scope: this.scope,
                model: this.model,
                selector: '.record',
                formatList: formatList,
            });
        },

        getRecordView: function () {
            return this.getView('record');
        },

        actionExport: function () {
            let recordView = this.getRecordView();

            let data = recordView.fetch();

            this.model.set(data);

            if (recordView.validate()) {
                return;
            }

            let returnData = {
                exportAllFields: data.exportAllFields,
                format: data.format,
            };

            if (!data.exportAllFields) {
                let attributeList = [];

                data.fieldList.forEach(item => {
                    if (item === 'id') {
                        attributeList.push('id');

                        return;
                    }

                    let type = this.getMetadata().get(['entityDefs', this.scope, 'fields', item, 'type']);

                    if (type) {
                        this.getFieldManager().getAttributeList(type, item)
                            .forEach(attribute => {
                                attributeList.push(attribute);
                            });
                    }

                    if (~item.indexOf('_')) {
                        attributeList.push(item);
                    }
                });

                returnData.attributeList = attributeList;
                returnData.fieldList = data.fieldList;
            }

            returnData.params = {};

            recordView.getFormatParamList(data.format).forEach(param => {
                let name = recordView.modifyParamName(data.format, param);

                let fieldView = recordView.getFieldView(name);

                if (!fieldView || fieldView.disabled) {
                    return;
                }

                this.getFieldManager()
                    .getActualAttributeList(fieldView.type, param)
                    .forEach(subParam => {
                        let name = recordView.modifyParamName(data.format, subParam);

                        returnData.params[subParam] = data[name];
                    });
            });

            this.trigger('proceed', returnData);
            this.close();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/event/fields/name-for-history', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        listLinkTemplate: 'event/fields/name-for-history/list-link',

        data: function () {
            let data = Dep.prototype.data.call(this);

            let status = this.model.get('status');

            let canceledStatusList = this.getMetadata()
                .get(['scopes', this.model.entityType, 'canceledStatusList']) || [];

            data.strikethrough = canceledStatusList.includes(status);

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/list', ['views/list-with-categories'], function (Dep) {

    return Dep.extend({

        quickCreate: false,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/record/edit', ['views/record/edit', 'views/email-template/record/detail'], function (Dep, Detail) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);
            Detail.prototype.listenToInsertField.call(this);
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/record/edit-quick',
['views/record/edit', 'views/email-template/record/detail'], function (Dep, Detail) {

    return Dep.extend({

    	isWide: true,
        sideView: false,

        setup: function () {
            Dep.prototype.setup.call(this);
            Detail.prototype.listenToInsertField.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/record/panels/information', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

        templateContent: '{{{infoText}}}',

        data: function () {
            const list2 = this.getMetadata().get(['clientDefs', 'EmailTemplate', 'placeholderList']) || [];

            const defs = this.getMetadata().get('app.emailTemplate.placeholders') || {};

            const list1 = Object.keys(defs)
                .sort((a, b) => {
                    const o1 = defs[a].order || 0;
                    const o2 = defs[b].order || 0;

                    return o1 - o2;
                });

            const placeholderList = [...list1, ...list2];

            if (!placeholderList.length) {
                return {
                    infoText: ''
                };
            }

            const $header = $('<h4>').text(this.translate('Available placeholders', 'labels', 'EmailTemplate') + ':');

            const $liList = placeholderList.map(item => {
                return $('<li>').append(
                    $('<code>').text('{' + item + '}'),
                    ' &#8211; ',
                    $('<span>').text(this.translate(item, 'placeholderTexts', 'EmailTemplate'))
                )
            });

            const $ul = $('<ul>').append($liList);

            const $text = $('<span>')
                .addClass('complex-text')
                .append($header, $ul);

            return {
                infoText: $text[0].outerHTML,
            };
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/fields/insert-field', ['views/fields/base', 'ui/select'],
function (Dep, /** module:ui/select */Select) {

    return Dep.extend({

        inlineEditDisabled: true,

        detailTemplate: 'email-template/fields/insert-field/detail',
        editTemplate: 'email-template/fields/insert-field/edit',

        data: function () {
            return {};
        },

        events: {
            'click [data-action="insert"]': function () {
                var entityType = this.$entityType.val();
                var field = this.$field.val();

                if (!field) {
                    return;
                }

                this.insert(entityType, field);
            },
        },

        setup: function () {
            if (this.mode !== this.MODE_LIST) {
                var entityList = [];

                var defs = this.getMetadata().get('scopes');

                entityList = Object.keys(defs).filter(scope => {
                    if (scope === 'Email') {
                        return;
                    }

                    if (!this.getAcl().checkScope(scope)) {
                        return;
                    }

                    return (defs[scope].entity && (defs[scope].object));
                });

                this.translatedOptions = {};

                var entityPlaceholders = {};

                entityList.forEach(scope => {
                    this.translatedOptions[scope] = {};

                    entityPlaceholders[scope] = this.getScopeAttributeList(scope);

                    entityPlaceholders[scope].forEach(item => {
                        this.translatedOptions[scope][item] = this.translatePlaceholder(scope, item);
                    });

                    var links = this.getMetadata().get('entityDefs.' + scope + '.links') || {};

                    var linkList = Object.keys(links).sort((v1, v2) => {
                        return this.translate(v1, 'links', scope).localeCompare(this.translate(v2, 'links', scope));
                    });

                    linkList.forEach((link) => {
                        var type = links[link].type

                        if (type !== 'belongsTo') {
                            return;
                        }

                        var foreignScope = links[link].entity;

                        if (!foreignScope) {
                            return;
                        }

                        if (links[link].disabled || links[link].utility) {
                            return;
                        }

                        if (
                            this.getMetadata().get(['entityAcl', scope, 'links', link, 'onlyAdmin']) ||
                            this.getMetadata().get(['entityAcl', scope, 'links', link, 'forbidden']) ||
                            this.getMetadata().get(['entityAcl', scope, 'links', link, 'internal'])
                        ) {
                            return;
                        }

                        var attributeList = this.getScopeAttributeList(foreignScope);

                        attributeList.forEach((item) => {
                            entityPlaceholders[scope].push(link + '.' + item);

                            this.translatedOptions[scope][link + '.' + item] =
                                this.translatePlaceholder(scope, link + '.' + item);
                        });
                    });
                });

                entityPlaceholders['Person'] =
                    ['name', 'firstName', 'lastName', 'salutationName', 'emailAddress', 'assignedUserName'];

                this.translatedOptions['Person'] = {};

                this.entityList = entityList;
                this.entityFields = entityPlaceholders;
            }
        },

        getScopeAttributeList: function (scope) {
            var fieldList = this.getFieldManager().getEntityTypeFieldList(scope);

            var list = [];

            fieldList = fieldList.sort((v1, v2) => {
                return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
            });

            fieldList.forEach(field => {
                var fieldType = this.getMetadata().get(['entityDefs', scope, 'fields', field, 'type']);

                let aclDefs = this.getMetadata().get(['entityAcl', scope, 'fields', field]) || {};
                let fieldDefs = this.getMetadata().get(['entityDefs', scope, 'fields', field]) || {};

                if (
                    aclDefs.onlyAdmin ||
                    aclDefs.forbidden ||
                    aclDefs.internal ||
                    fieldDefs.disabled ||
                    fieldDefs.utility ||
                    fieldDefs.directAccessDisabled ||
                    fieldDefs.templatePlaceholderDisabled
                ) {
                    return false;
                }

                if (fieldType === 'map') return;
                if (fieldType === 'linkMultiple') return;
                if (fieldType === 'attachmentMultiple') return;

                if (
                    this.getMetadata().get(['entityAcl', scope, 'fields', field, 'onlyAdmin']) ||
                    this.getMetadata().get(['entityAcl', scope, 'fields', field, 'forbidden']) ||
                    this.getMetadata().get(['entityAcl', scope, 'fields', field, 'internal'])
                ) {
                    return;
                }

                var fieldAttributeList = this.getFieldManager().getAttributeList(fieldType, field);

                fieldAttributeList.forEach((attribute) => {
                    if (~list.indexOf(attribute)) {
                        return;
                    }

                    list.push(attribute);
                });
            });

            var forbiddenList = this.getAcl().getScopeForbiddenAttributeList(scope);

            list = list.filter((item) => {
                if (~forbiddenList.indexOf(item)) {
                    return;
                }

                return true;
            });

            list.push('id');

            if (this.getMetadata().get('entityDefs.' + scope + '.fields.name.type') === 'personName') {
                list.unshift('name');
            }

            return list;
        },

        translatePlaceholder: function (entityType, item) {
            var field = item;
            var scope = entityType;
            var isForeign = false;

            if (~item.indexOf('.')) {
                isForeign = true;
                field = item.split('.')[1];
                var link = item.split('.')[0];

                scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
            }

            var label = item;

            label = this.translate(field, 'fields', scope);

            if (field.indexOf('Id') === field.length - 2) {
                var baseField = field.substr(0, field.length - 2);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('id', 'fields') + ')';
                }
            }
            else if (field.indexOf('Name') === field.length - 4) {
                var baseField = field.substr(0, field.length - 4);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('name', 'fields') + ')';
                }
            }
            else if (field.indexOf('Type') === field.length - 4) {
                var baseField = field.substr(0, field.length - 4);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('type', 'fields') + ')';
                }
            }

            if (field.indexOf('Ids') === field.length - 3) {
                var baseField = field.substr(0, field.length - 3);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('ids', 'fields') + ')';
                }
            }
            else if (field.indexOf('Names') === field.length - 5) {
                var baseField = field.substr(0, field.length - 5);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('names', 'fields') + ')';
                }
            }
            else if (field.indexOf('Types') === field.length - 5) {
                var baseField = field.substr(0, field.length - 5);

                if (this.getMetadata().get(['entityDefs', scope, 'fields', baseField])) {
                    label = this.translate(baseField, 'fields', scope) + ' (' + this.translate('types', 'fields') + ')';
                }
            }

            if (isForeign) {
                label = this.translate(link, 'links', entityType) + '.' + label;
            }

            return label;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === this.MODE_EDIT) {
                var entityTranslation = {};

                this.entityList.forEach((scope) => {
                    entityTranslation[scope] = this.translate(scope, 'scopeNames');
                });

                this.entityList.sort((a, b) => {
                    return a.localeCompare(b);
                });

                var $entityType = this.$entityType = this.$el.find('[data-name="entityType"]');

                this.$field = this.$el.find('[data-name="field"]');

                $entityType.on('change', () => {
                    this.changeEntityType();
                });

                $entityType.append(
                    $('<option>')
                        .val('Person')
                        .text(this.translate('Person'))
                );

                this.entityList.forEach(scope => {
                    $entityType.append(
                        $('<option>')
                            .val(scope)
                            .text(entityTranslation[scope])
                    );
                });

                Select.init(this.$field);

                this.changeEntityType();

                Select.init(this.$entityType);
            }
        },

        changeEntityType: function () {
            var entityType = this.$entityType.val();
            var fieldList = this.entityFields[entityType];

            Select.setValue(this.$field, '');

            Select.setOptions(this.$field, fieldList.map(field => {
                return {
                    value: field,
                    label: this.translateItem(entityType, field),
                };
            }));
        },

        translateItem: function (entityType, item) {
            if (this.translatedOptions[entityType][item]) {
                return this.translatedOptions[entityType][item];
            }

            return this.translate(item, 'fields');
        },

        insert: function (entityType, field) {
            this.model.trigger('insert-field', {
                entityType: entityType,
                field: field,
            });
        }
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-template/fields/body', ['views/fields/wysiwyg'], function (Dep) {

    return Dep.extend({});
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/list', ['views/list'], function (Dep) {

    return Dep.extend({

        quickCreate: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.collection.data = {
                boolFilterList: ['onlyMy'],
            };
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/list-side', ['view'], function (Dep) {

    return Dep.extend({

        template: 'email-folder/list-side',

        FOLDER_ALL: 'all',
        FOLDER_INBOX: 'inbox',
        FOLDER_DRAFTS: 'drafts',

        events: {
            'click [data-action="selectFolder"]': function (e) {
                e.preventDefault();

                let id = $(e.currentTarget).data('id');

                this.actionSelectFolder(id);
            }
        },

        data: function () {
            let data = {};

            data.selectedFolderId = this.selectedFolderId;
            data.showEditLink = this.options.showEditLink;
            data.scope = this.scope;

            return data;
        },

        actionSelectFolder: function (id) {
            this.$el.find('li.selected').removeClass('selected');

            this.selectFolder(id);

            this.$el.find('li[data-id="'+id+'"]').addClass('selected');
        },

        setup: function () {
            this.scope = 'EmailFolder';
            this.selectedFolderId = this.options.selectedFolderId || this.FOLDER_ALL;
            this.emailCollection = this.options.emailCollection;

            this.loadNotReadCounts();

            this.listenTo(this.emailCollection, 'sync', this.loadNotReadCounts);
            this.listenTo(this.emailCollection, 'folders-update', this.loadNotReadCounts);

            this.listenTo(this.emailCollection, 'all-marked-read', () => {
                this.countsData = this.countsData || {};

                for (let id in this.countsData) {
                    if (id === this.FOLDER_DRAFTS) {
                        continue;
                    }

                    this.countsData[id] = 0;
                }

                this.renderCounts();
            });

            this.listenTo(this.emailCollection, 'draft-sent', () => {
                this.decreaseNotReadCount(this.FOLDER_DRAFTS);
                this.renderCounts();
            });

            this.listenTo(this.emailCollection, 'change:isRead', model => {
                if (this.countsIsBeingLoaded) {
                    return;
                }

                this.manageCountsDataAfterModelChanged(model);
            });

            this.listenTo(this.emailCollection, 'model-removing', id => {
                let model = this.emailCollection.get(id);

                if (!model) {
                    return;
                }

                if (this.countsIsBeingLoaded) {
                    return;
                }

                this.manageModelRemoving(model);
            });

            this.listenTo(this.emailCollection, 'moving-to-trash', (id, model) => {
                model = this.emailCollection.get(id) || model;

                if (!model) {
                    return;
                }

                if (this.countsIsBeingLoaded) {
                    return;
                }

                this.manageModelRemoving(model);
            });

            this.listenTo(this.emailCollection, 'retrieving-from-trash', (id, model) => {
                model = this.emailCollection.get(id) || model;

                if (!model) {
                    return;
                }

                if (this.countsIsBeingLoaded) {
                    return;
                }

                this.manageModelRetrieving(model);
            });
        },

        manageModelRemoving: function (model) {
            if (model.get('status') === 'Draft') {
                this.decreaseNotReadCount(this.FOLDER_DRAFTS);
                this.renderCounts();

                return;
            }

            if (!model.get('isUsers')) {
                return;
            }

            if (model.get('isRead')) {
                return;
            }

            let folderId = model.get('groupFolderId') ?
                ('group:' + model.get('groupFolderId')) :
                (model.get('folderId') || this.FOLDER_INBOX);

            this.decreaseNotReadCount(folderId);
            this.renderCounts();
        },

        manageModelRetrieving: function (model) {
            if (!model.get('isUsers')) {
                return;
            }

            if (model.get('isRead')) {
                return;
            }

            let folderId = model.get('groupFolderId') ?
                ('group:' + model.get('groupFolderId')) :
                (model.get('folderId') || this.FOLDER_INBOX);

            this.increaseNotReadCount(folderId);
            this.renderCounts();
        },

        manageCountsDataAfterModelChanged: function (model) {
            if (!model.get('isUsers')) {
                return;
            }

            let folderId = model.get('groupFolderId') ?
                ('group:' + model.get('groupFolderId')) :
                (model.get('folderId') || this.FOLDER_INBOX);

            !model.get('isRead') ?
                this.increaseNotReadCount(folderId) :
                this.decreaseNotReadCount(folderId);

            this.renderCounts();
        },

        increaseNotReadCount: function (folderId) {
            this.countsData = this.countsData || {};
            this.countsData[folderId] = this.countsData[folderId] || 0;
            this.countsData[folderId]++;
        },

        decreaseNotReadCount: function (folderId) {
            this.countsData = this.countsData || {};

            this.countsData[folderId] = this.countsData[folderId] || 0;

            if (this.countsData[folderId]) {
                this.countsData[folderId]--;
            }
        },

        selectFolder: function (id) {
            this.emailCollection.reset();
            this.emailCollection.abortLastFetch();

            this.selectedFolderId = id;
            this.trigger('select', id);
        },

        afterRender: function () {
            if (this.countsData) {
                this.renderCounts();
            }
        },

        loadNotReadCounts: function () {
            if (this.countsIsBeingLoaded) {
                return;
            }

            this.countsIsBeingLoaded = true;

            Espo.Ajax.getRequest('Email/inbox/notReadCounts').then(data => {
                this.countsData = data;

                if (this.isRendered()) {
                    this.renderCounts();
                    this.countsIsBeingLoaded = false;

                    return;
                }

                this.once('after:render', () => {
                    this.renderCounts();
                    this.countsIsBeingLoaded = false;
                });
            });
        },

        renderCounts: function () {
            let data = this.countsData;

            for (let id in data) {
                let value = '';

                if (data[id]) {
                    value = data[id].toString();
                }

                this.$el.find('li a.count[data-id="'+id+'"]').text(value);
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massUpdateDisabled: true,

        massRemoveDisabled: true,

        mergeDisabled: true,

        exportDisabled: true,

        removeDisabled: true,

        rowActionsView: 'views/email-folder/record/row-actions/default',

        actionMoveUp: function (data) {
            var model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            var index = this.collection.indexOf(model);

            if (index === 0) {
                return;
            }

            Espo.Ajax.postRequest('EmailFolder/action/moveUp', {id: model.id}).then(() => {
                this.collection.fetch();
            });
        },

        actionMoveDown: function (data) {
            var model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            var index = this.collection.indexOf(model);

            if ((index === this.collection.length - 1) && (this.collection.length === this.collection.total)) {
                return;
            }

            Espo.Ajax.postRequest('EmailFolder/action/moveDown', {id: model.id}).then(() => {
                this.collection.fetch();
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        getActionList: function () {
            var list = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit) {
                list.unshift({
                    action: 'moveDown',
                    label: 'Move Down',
                    data: {
                        id: this.model.id,
                    },
                });

                list.unshift({
                    action: 'moveUp',
                    label: 'Move Up',
                    data: {
                        id: this.model.id,
                    },
                });
            }

            return list;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-folder/modals/select-folder', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'select-folder',

        template: 'email-folder/modals/select-folder',

        fitHeight: true,

        backdrop: true,

        data: function () {
            return {
                folderDataList: this.folderDataList,
            };
        },

        events: {
            'click a[data-action="selectFolder"]': function (e) {
                let $target = $(e.currentTarget);

                let id = $target.attr('data-id');
                let name = $target.attr('data-name');

                this.trigger('select', id, name);
                this.close();
            },
        },

        setup: function () {
            this.headerText = this.options.headerText || '';

            if (this.headerText === '') {
                this.buttonList.push({
                    name: 'cancel',
                    label: 'Cancel',
                });
            }

            Espo.Ui.notify(' ... ');

            this.wait(
                Espo.Ajax.getRequest('EmailFolder/action/listAll')
                    .then(data => {
                        Espo.Ui.notify(false);

                        this.folderDataList = data.list
                            .filter(item => {
                                return ['inbox', 'important', 'sent', 'drafts', 'trash'].indexOf(item.id) === -1;
                            })
                            .map(item => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    isGroup: item.id.indexOf('group:') === 0,
                                };
                            });

                        this.folderDataList.unshift({
                            id: 'inbox',
                            name: this.translate('inbox', 'presetFilters', 'Email'),
                        })
                    })
            );
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-filter/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: ['remove', 'export'],
    });
});


/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-filter/modals/edit', ['views/modals/edit'], function (Dep) {

    return Dep.extend({

        fullFormDisabled: true,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-filter/fields/parent', ['views/fields/link-parent'], function (Dep) {

    return Dep.extend({

        getSelectPrimaryFilterName: function () {
            var map = {
                'User': 'active',
            };

            if (!this.foreignScope) {
                return;
            }

            return map[this.foreignScope];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-filter/fields/email-folder', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        createDisabled: true,

        autocompleteDisabled: true,

        getSelectFilters: function () {
            if (this.getUser().isAdmin()) {
                if (this.model.get('parentType') === 'User' && this.model.get('parentId')) {
                    return {
                        assignedUser: {
                            type: 'equals',
                            attribute: 'assignedUserId',
                            value: this.model.get('parentId'),
                            data: {
                                nameValue: this.model.get('parentName'),
                            },
                        }
                    };
                }
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-filter/fields/action', ['views/fields/enum'], function (Dep) {

    return Dep.extend({});
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/list', ['views/list'], function (Dep) {

    return Dep.extend({

        keepCurrentRootUrl: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.options.params = this.options.params || {};

            var params = this.options.params || {};
            if (params.userId) {
                this.collection.where = [{
                    type: 'equals',
                    field: 'assignedUserId',
                    value: params.userId
                }];
            }
        },

        getCreateAttributes: function () {
            var attributes = {};
            if (this.options.params.userId) {
                attributes.assignedUserId = this.options.params.userId;
                attributes.assignedUserName = this.options.params.userName || this.options.params.userId;
            }
            return attributes;
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    	quickDetailDisabled: true,
        quickEditDisabled: true,
        checkAllResultDisabled: true,
        massActionList: ['remove', 'massUpdate'],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/record/edit', ['views/record/edit', 'views/email-account/record/detail'],
function (Dep, Detail) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            Detail.prototype.setupFieldsBehaviour.call(this);
            Detail.prototype.initSslFieldListening.call(this);
            Detail.prototype.initSmtpFieldsControl.call(this);

            if (this.getUser().isAdmin()) {
                this.setFieldNotReadOnly('assignedUser');
            } else {
                this.setFieldReadOnly('assignedUser');
            }
        },

        modifyDetailLayout: function (layout) {
            Detail.prototype.modifyDetailLayout.call(this, layout);
        },

        setupFieldsBehaviour: function () {
            Detail.prototype.setupFieldsBehaviour.call(this);
        },

        controlStatusField: function () {
            Detail.prototype.controlStatusField.call(this);
        },

        controlSmtpFields: function () {
            Detail.prototype.controlSmtpFields.call(this);
        },

        controlSmtpAuthField: function () {
            Detail.prototype.controlSmtpAuthField.call(this);
        },

        wasFetched: function () {
            Detail.prototype.wasFetched.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/modals/select-folder', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'select-folder-modal',

        template: 'email-account/modals/select-folder',

        data: function () {
            return {
                folders: this.options.folders,
            };
        },

        events: {
            'click [data-action="select"]': function (e) {
                var value = $(e.currentTarget).data('value');

                this.trigger('select', value);
            },
        },

        setup: function () {
            this.headerText = this.translate('Select');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/fields/email-folder', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        createDisabled: true,
        autocompleteDisabled: true,

        getSelectFilters: function () {
            if (this.getUser().isAdmin()) {
                if (this.model.get('assignedUserId')) {
                    return {
                        assignedUser: {
                            type: 'equals',
                            attribute: 'assignedUserId',
                            value: this.model.get('assignedUserId'),
                            data: {
                                type: 'is',
                                nameValue: this.model.get('assignedUserName'),
                            },
                        }
                    };
                }
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:assignedUserId', (model, e, o) => {
                if (o.ui) {
                    this.model.set({
                        emailFolderId: null,
                        emailFolderName: null,
                    });
                }
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email-account/fields/email-address', ['views/fields/email-address'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('change', () => {
                var emailAddress = this.model.get('emailAddress');
                this.model.set('name', emailAddress);
            });

            var userId = this.model.get('assignedUserId');

            if (this.getUser().isAdmin() && userId !== this.getUser().id) {
                Espo.Ajax.getRequest('User/' + userId).then((data) => {
                    var list = [];

                    if (data.emailAddress) {
                        list.push(data.emailAddress);

                        this.params.options = list;

                        if (data.emailAddressData) {
                            data.emailAddressData.forEach(item => {
                                if (item.emailAddress === data.emailAddress) {
                                    return;
                                }

                                list.push(item.emailAddress);
                            });
                        }

                        this.reRender();
                    }
                });
            }
        },

        setupOptions: function () {
            if (this.model.get('assignedUserId') === this.getUser().id) {
                this.params.options = this.getUser().get('userEmailAddressList');
            }
        },

    });
});

define("views/email/list", ["exports", "views/list"], function (_exports, _list) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _list = _interopRequireDefault(_list);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailListView extends _list.default {
    createButton = false;
    template = 'email/list';
    folderId = null;
    folderScope = 'EmailFolder';
    selectedFolderId = null;
    defaultFolderId = 'inbox';
    keepCurrentRootUrl = true;
    stickableTop = null;

    /** @const */
    FOLDER_ALL = 'all';
    /** @const */
    FOLDER_INBOX = 'inbox';
    /** @const */
    FOLDER_IMPORTANT = 'important';
    /** @const */
    FOLDER_SENT = 'sent';
    /** @const */
    FOLDER_DRAFTS = 'drafts';
    /** @const */
    FOLDER_TRASH = 'trash';
    noDropFolderIdList = ['sent', 'drafts'];

    /** @inheritDoc */
    createListRecordView(fetch) {
      return super.createListRecordView(fetch).then(view => {
        this.listenTo(view, 'after:render', () => this.initDraggable(null));
        this.listenTo(view, 'after:show-more', fromIndex => this.initDraggable(fromIndex));
      });
    }

    /**
     * @private
     */
    initDroppable() {
      // noinspection JSUnresolvedReference
      this.$el.find('.folders-container .folder-list > .droppable').droppable({
        accept: '.list-row',
        tolerance: 'pointer',
        over: e => {
          if (!this.isDroppable(e)) {
            return;
          }
          const $target = $(e.target);
          $target.removeClass('success');
          $target.addClass('active');
          $target.find('a').css('pointer-events', 'none');
        },
        out: e => {
          if (!this.isDroppable(e)) {
            return;
          }
          const $target = $(e.target);
          $target.removeClass('active');
          $target.find('a').css('pointer-events', '');
        },
        drop: (e, ui) => {
          if (!this.isDroppable(e)) {
            return;
          }
          const $target = $(e.target);
          const $helper = $(ui.helper);
          $target.find('a').css('pointer-events', '');
          const folderId = $target.attr('data-id');
          let id = $helper.attr('data-id');
          id = id === '' ? true : id;
          this.onDrop(folderId, id);
          $target.removeClass('active');
          $target.addClass('success');
          setTimeout(() => {
            $target.removeClass('success');
          }, 1000);
        }
      });
    }

    /**
     * @private
     * @param {?Number} fromIndex
     */
    initDraggable(fromIndex) {
      fromIndex = fromIndex || 0;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        return;
      }
      const $container = this.$el.find('.list-container > .list');
      const recordView = this.getEmailRecordView();
      this.collection.models.slice(fromIndex).forEach(m => {
        const $row = $container.find(`.list-row[data-id="${m.id}"]`).first();

        // noinspection JSUnresolvedReference
        $row.draggable({
          cancel: 'input,textarea,button,select,option,.dropdown-menu',
          helper: () => {
            let text = this.translate('Moving to Folder', 'labels', 'Email');
            if (recordView.isIdChecked(m.id) && !recordView.allResultIsChecked && recordView.checkedList.length > 1) {
              text += ' · ' + recordView.checkedList.length;
            }
            let draggedId = m.id;
            if (recordView.isIdChecked(m.id) && !recordView.allResultIsChecked) {
              draggedId = '';
            }
            return $('<div>').attr('data-id', draggedId).css('cursor', 'grabbing').addClass('draggable-helper').text(text);
          },
          distance: 8,
          containment: this.$el,
          appendTo: 'body',
          cursor: 'grabbing',
          cursorAt: {
            top: 0,
            left: 0
          },
          start: e => {
            const $target = $(e.target);
            $target.closest('tr').addClass('active');
          },
          stop: () => {
            if (!recordView.isIdChecked(m.id)) {
              $container.find(`.list-row[data-id="${m.id}"]`).first().removeClass('active');
            }
          }
        });
      });
    }
    isDroppable(e) {
      const $target = $(e.target);
      const folderId = $target.attr('data-id');
      if (this.selectedFolderId === this.FOLDER_DRAFTS) {
        return false;
      }
      if (this.selectedFolderId === this.FOLDER_SENT && folderId === this.FOLDER_INBOX) {
        return false;
      }
      if (this.selectedFolderId === this.FOLDER_ALL) {
        if (folderId.indexOf('group:') === 0) {
          return true;
        }
        return false;
      }
      if (folderId === this.FOLDER_ALL) {
        if (this.selectedFolderId.indexOf('group:') === 0) {
          return true;
        }
        return false;
      }
      if (this.selectedFolderId === this.FOLDER_DRAFTS) {
        if (folderId.indexOf('group:') === 0) {
          return true;
        }
        if (folderId === this.FOLDER_TRASH) {
          return false;
        }
        return true;
      }
      return true;
    }
    setup() {
      super.setup();
      this.addMenuItem('dropdown', false);
      if (this.getAcl().checkScope('EmailAccountScope')) {
        this.addMenuItem('dropdown', {
          name: 'reply',
          label: 'Email Accounts',
          link: '#EmailAccount/list/userId=' + this.getUser().id + '&userName=' + encodeURIComponent(this.getUser().get('name'))
        });
      }
      if (this.getUser().isAdmin()) {
        this.addMenuItem('dropdown', {
          link: '#InboundEmail',
          label: 'Inbound Emails'
        });
      }
      this.foldersDisabled = this.foldersDisabled || this.getConfig().get('emailFoldersDisabled') || this.getMetadata().get(['scopes', this.folderScope, 'disabled']) || !this.getAcl().checkScope(this.folderScope);
      const params = this.options.params || {};
      this.selectedFolderId = params.folder || this.defaultFolderId;
      if (this.foldersDisabled) {
        this.selectedFolderId = null;
      }
      this.applyFolder();
      this.initEmailShortcuts();
      this.on('remove', () => {
        $(window).off('resize.email-folders');
        $(window).off('scroll.email-folders');
      });
    }
    data() {
      const data = {};
      data.foldersDisabled = this.foldersDisabled;
      return data;
    }

    /** @inheritDoc */
    createSearchView() {
      /** @type {Promise<module:view>} */
      const promise = super.createSearchView();
      promise.then(view => {
        this.listenTo(view, 'update-ui', () => {
          this.stickableTop = null;
          setTimeout(() => {
            $(window).trigger('scroll');

            // If search fields are not yet rendered, the value may be wrong.
            this.stickableTop = null;
          }, 100);
        });
      });
      return promise;
    }
    initEmailShortcuts() {
      this.shortcutKeys['Control+Delete'] = e => {
        if (!this.hasSelectedRecords()) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.getEmailRecordView().massActionMoveToTrash();
      };
      this.shortcutKeys['Control+KeyI'] = e => {
        if (!this.hasSelectedRecords()) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.getEmailRecordView().toggleMassMarkAsImportant();
      };
      this.shortcutKeys['Control+KeyM'] = e => {
        if (!this.hasSelectedRecords()) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.getEmailRecordView().massActionMoveToFolder();
      };
    }
    hasSelectedRecords() {
      const recordView = this.getEmailRecordView();
      return recordView.checkedList && recordView.checkedList.length && !recordView.allResultIsChecked;
    }

    /** @inheritDoc */
    setupReuse(params) {
      this.applyRoutingParams(params);
      this.initDroppable();
      this.initStickableFolders();
    }

    /**
     * @param {Object.<string,*>} [data]
     */
    actionComposeEmail(data) {
      data = data || {};
      Espo.Ui.notify(' ... ');
      const viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
      const options = {
        attributes: {
          status: 'Draft'
        },
        focusForCreate: data.focusForCreate
      };
      this.createView('quickCreate', viewName, options, view => {
        view.render();
        view.notify(false);
        this.listenToOnce(view, 'after:save', () => {
          this.collection.fetch();
        });
      });
    }
    afterRender() {
      super.afterRender();
      if (!this.foldersDisabled && !this.hasView('folders')) {
        this.loadFolders();
      }
    }
    getFolderCollection(callback) {
      this.getCollectionFactory().create(this.folderScope, collection => {
        collection.url = 'EmailFolder/action/listAll';
        collection.maxSize = 200;
        this.listenToOnce(collection, 'sync', () => {
          callback.call(this, collection);
        });
        collection.fetch();
      });
    }
    loadFolders() {
      let xhr = null;
      const auxFolderList = [this.FOLDER_TRASH, this.FOLDER_DRAFTS, this.FOLDER_ALL, this.FOLDER_INBOX, this.FOLDER_IMPORTANT, this.FOLDER_SENT];
      this.getFolderCollection(collection => {
        collection.forEach(model => {
          if (this.noDropFolderIdList.indexOf(model.id) === -1) {
            model.droppable = true;
          }
          if (model.id.indexOf('group:') === 0) {
            model.title = this.translate('groupFolder', 'fields', 'Email');
          } else if (auxFolderList.indexOf(model.id) === -1) {
            model.title = this.translate('folder', 'fields', 'Email');
          }
        });
        this.createView('folders', 'views/email-folder/list-side', {
          collection: collection,
          emailCollection: this.collection,
          selector: '.folders-container',
          showEditLink: this.getAcl().check(this.folderScope, 'edit'),
          selectedFolderId: this.selectedFolderId
        }, view => {
          view.render().then(() => this.initDroppable()).then(() => this.initStickableFolders());
          this.listenTo(view, 'select', id => {
            this.selectedFolderId = id;
            this.applyFolder();
            if (xhr && xhr.readyState < 4) {
              xhr.abort();
            }
            Espo.Ui.notify(' ... ');
            xhr = this.collection.fetch().then(() => Espo.Ui.notify(false));
            if (id !== this.defaultFolderId) {
              this.getRouter().navigate('#Email/list/folder=' + id);
            } else {
              this.getRouter().navigate('#Email');
            }
            this.updateLastUrl();
          });
        });
      });
    }
    applyFolder() {
      this.collection.selectedFolderId = this.selectedFolderId;
      if (!this.selectedFolderId) {
        this.collection.whereFunction = null;
        return;
      }
      this.collection.whereFunction = () => {
        return [{
          type: 'inFolder',
          attribute: 'folderId',
          value: this.selectedFolderId
        }];
      };
    }

    /**
     * @protected
     * @return {module:views/email-folder/list-side}
     */
    getFoldersView() {
      return this.getView('folders');
    }
    applyRoutingParams(params) {
      let id;
      if ('folder' in params) {
        id = params.folder || 'inbox';
      } else {
        return;
      }
      if (!params.isReturnThroughLink && id !== this.selectedFolderId) {
        const foldersView = this.getFoldersView();
        if (foldersView) {
          foldersView.actionSelectFolder(id);
          foldersView.reRender();
          $(window).scrollTop(0);
        }
      }
    }
    onDrop(folderId, id) {
      const recordView = this.getEmailRecordView();
      if (folderId === this.FOLDER_IMPORTANT) {
        setTimeout(() => {
          id === true ? recordView.massActionMarkAsImportant() : recordView.actionMarkAsImportant({
            id: id
          });
        }, 10);
        return;
      }
      if (this.selectedFolderId === this.FOLDER_TRASH) {
        if (folderId === this.FOLDER_TRASH) {
          return;
        }
        id === true ? recordView.massRetrieveFromTrashMoveToFolder(folderId) : recordView.actionRetrieveFromTrashMoveToFolder({
          id: id,
          folderId: folderId
        });
        return;
      }
      if (folderId === this.FOLDER_TRASH) {
        id === true ? recordView.massActionMoveToTrash() : recordView.actionMoveToTrash({
          id: id
        });
        return;
      }
      if (this.selectedFolderId.indexOf('group:') === 0 && folderId === this.FOLDER_ALL) {
        folderId = this.FOLDER_INBOX;
      }
      id === true ? recordView.massMoveToFolder(folderId) : recordView.actionMoveToFolder({
        id: id,
        folderId: folderId
      });
    }

    /**
     * @protected
     * @return {module:views/email/record/list}
     */
    getEmailRecordView() {
      return (/** @type {module:views/email/record/list} */this.getRecordView()
      );
    }

    /**
     * @private
     */
    initStickableFolders() {
      const $window = $(window);
      const $list = this.$el.find('.list-container');
      const $container = this.$el.find('.folders-container');
      const $left = this.$el.find('.left-container').first();
      const screenWidthXs = this.getThemeManager().getParam('screenWidthXs');
      const isSmallScreen = $(window.document).width() < screenWidthXs;
      const offset = this.getThemeManager().getParam('navbarHeight') + (this.getThemeManager().getParam('buttonsContainerHeight') || 47);
      const bottomSpaceHeight = parseInt(window.getComputedStyle($('#content').get(0)).paddingBottom, 10);
      const getOffsetTop = ( /** JQuery */$element) => {
        let element = /** @type {HTMLElement} */$element.get(0);
        let value = 0;
        while (element) {
          value += !isNaN(element.offsetTop) ? element.offsetTop : 0;
          element = element.offsetParent;
        }
        if (isSmallScreen) {
          return value;
        }
        return value - offset;
      };
      this.stickableTop = getOffsetTop($list);
      const control = () => {
        let start = this.stickableTop;
        if (start === null) {
          start = this.stickableTop = getOffsetTop($list);
        }
        const scrollTop = $window.scrollTop();
        if (scrollTop <= start || isSmallScreen) {
          $container.removeClass('sticked').width('').scrollTop(0);
          $container.css({
            maxHeight: ''
          });
          return;
        }
        if (scrollTop > start) {
          const scroll = $window.scrollTop() - start;
          $container.addClass('sticked').width($left.outerWidth(true)).scrollTop(scroll);
          const topStickPosition = parseInt(window.getComputedStyle($container.get(0)).top);
          const maxHeight = $window.height() - topStickPosition - bottomSpaceHeight;
          $container.css({
            maxHeight: maxHeight
          });
        }
      };
      $window.on('resize.email-folders', () => control());
      $window.on('scroll.email-folders', () => control());
    }

    /**
     * @protected
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyCtrlSpace(e) {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return;
      }
      if (!this.getAcl().checkScope(this.scope, 'create')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.actionComposeEmail({
        focusForCreate: true
      });
    }
  }
  var _default = EmailListView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/list-related', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: ['remove', 'massUpdate'],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define(
    'views/email/record/list-expanded',
    ['views/record/list-expanded', 'views/email/record/list'],
    function (Dep, List) {

    return Dep.extend({

        actionMarkAsImportant: function (data) {
            List.prototype.actionMarkAsImportant.call(this, data);
        },

        actionMarkAsNotImportant: function (data) {
            List.prototype.actionMarkAsNotImportant.call(this, data);
        },

        actionMoveToTrash: function (data) {
            List.prototype.actionMoveToTrash.call(this, data);
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/edit-quick', ['views/email/record/edit'], function (Dep) {

    return Dep.extend({

    	isWide: true,
        sideView: false,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/detail-side', ['views/record/detail-side'], function (Dep) {

    return Dep.extend({});
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/detail-quick', ['views/email/record/detail'], function (Dep) {

    return Dep.extend({

    	isWide: true,
        sideView: false,
    });
});

define("views/email/record/compose", ["exports", "views/record/edit", "views/email/record/detail"], function (_exports, _edit, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _edit = _interopRequireDefault(_edit);
  _detail = _interopRequireDefault(_detail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module views/email/record/compose */

  class EmailComposeRecordView extends _edit.default {
    isWide = true;
    sideView = false;
    setupBeforeFinal() {
      super.setupBeforeFinal();
      this.initialBody = null;
      this.initialIsHtml = null;
      if (!this.model.get('isHtml') && this.getPreferences().get('emailReplyForceHtml')) {
        const body = (this.model.get('body') || '').replace(/\n/g, '<br>');
        this.model.set('body', body, {
          silent: true
        });
        this.model.set('isHtml', true, {
          silent: true
        });
      }
      if (this.model.get('body')) {
        this.initialBody = this.model.get('body');
        this.initialIsHtml = this.model.get('isHtml');
      }
      if (!this.options.signatureDisabled && this.hasSignature()) {
        let addSignatureMethod = 'prependSignature';
        if (this.options.appendSignature) {
          addSignatureMethod = 'appendSignature';
        }
        const body = this[addSignatureMethod](this.model.get('body') || '', this.model.get('isHtml'));
        this.model.set('body', body, {
          silent: true
        });
      }
    }
    setup() {
      super.setup();
      this.isBodyChanged = false;
      this.listenTo(this.model, 'change:body', () => {
        this.isBodyChanged = true;
      });
      if (!this.options.removeAttachmentsOnSelectTemplate) {
        this.initialAttachmentsIds = this.model.get('attachmentsIds') || [];
        this.initialAttachmentsNames = this.model.get('attachmentsNames') || {};
      }
      this.initInsertTemplate();
      if (this.options.selectTemplateDisabled) {
        this.hideField('selectTemplate');
      }
    }
    initInsertTemplate() {
      this.listenTo(this.model, 'insert-template', data => {
        const body = this.model.get('body') || '';
        let bodyPlain = body.replace(/<br\s*\/?>/mg, '');
        bodyPlain = bodyPlain.replace(/<\/p\s*\/?>/mg, '');
        bodyPlain = bodyPlain.replace(/ /g, '');
        bodyPlain = bodyPlain.replace(/\n/g, '');
        const $div = $('<div>').html(bodyPlain);
        bodyPlain = $div.text();
        if (bodyPlain !== '' && this.isBodyChanged) {
          this.confirm({
            message: this.translate('confirmInsertTemplate', 'messages', 'Email'),
            confirmText: this.translate('Yes')
          }).then(() => this.insertTemplate(data));
          return;
        }
        this.insertTemplate(data);
      });
    }
    insertTemplate(data) {
      let body = data.body;
      if (this.hasSignature()) {
        body = this.appendSignature(body || '', data.isHtml);
      }
      if (this.initialBody && !this.isBodyChanged) {
        let initialBody = this.initialBody;
        if (data.isHtml !== this.initialIsHtml) {
          if (data.isHtml) {
            initialBody = this.plainToHtml(initialBody);
          } else {
            initialBody = this.htmlToPlain(initialBody);
          }
        }
        body += initialBody;
      }
      this.model.set('isHtml', data.isHtml);
      if (data.subject) {
        this.model.set('name', data.subject);
      }
      this.model.set('body', '');
      this.model.set('body', body);
      if (!this.options.removeAttachmentsOnSelectTemplate) {
        this.initialAttachmentsIds.forEach(id => {
          if (data.attachmentsIds) {
            data.attachmentsIds.push(id);
          }
          if (data.attachmentsNames) {
            data.attachmentsNames[id] = this.initialAttachmentsNames[id] || id;
          }
        });
      }
      this.model.set({
        attachmentsIds: data.attachmentsIds,
        attachmentsNames: data.attachmentsNames
      });
      this.isBodyChanged = false;
    }
    prependSignature(body, isHtml) {
      if (isHtml) {
        let signature = this.getSignature();
        if (body) {
          signature += '';
        }
        return '<p><br></p>' + signature + body;
      }
      let signature = this.getPlainTextSignature();
      if (body) {
        signature += '\n';
      }
      return '\n\n' + signature + body;
    }
    appendSignature(body, isHtml) {
      if (isHtml) {
        const signature = this.getSignature();
        return body + '' + signature;
      }
      const signature = this.getPlainTextSignature();
      return body + '\n\n' + signature;
    }
    hasSignature() {
      return !!this.getPreferences().get('signature');
    }
    getSignature() {
      return this.getPreferences().get('signature') || '';
    }
    getPlainTextSignature() {
      let value = this.getSignature().replace(/<br\s*\/?>/mg, '\n');
      value = $('<div>').html(value).text();
      return value;
    }
    afterSave() {
      super.afterRender();
      if (this.isSending && this.model.get('status') === 'Sent') {
        Espo.Ui.success(this.translate('emailSent', 'messages', 'Email'));
      }
    }
    send() {
      _detail.default.prototype.send.call(this);
    }
    saveDraft(options) {
      const model = this.model;
      model.set('status', 'Draft');
      const subjectView = this.getFieldView('subject');
      if (subjectView) {
        subjectView.fetchToModel();
        if (!model.get('name')) {
          model.set('name', this.translate('No Subject', 'labels', 'Email'));
        }
      }
      return this.save(options);
    }
    htmlToPlain(text) {
      text = text || '';
      let value = text.replace(/<br\s*\/?>/mg, '\n');
      value = value.replace(/<\/p\s*\/?>/mg, '\n\n');
      const $div = $('<div>').html(value);
      $div.find('style').remove();
      $div.find('link[ref="stylesheet"]').remove();
      value = $div.text();
      return value;
    }
    plainToHtml(html) {
      html = html || '';
      return html.replace(/\n/g, '<br>');
    }

    // noinspection JSUnusedGlobalSymbols
    errorHandlerSendingFail(data) {
      _detail.default.prototype.errorHandlerSendingFail.call(this, data);
    }
    focusForCreate() {
      if (!this.model.get('to')) {
        this.$el.find('.field[data-name="to"] input').focus();
        return;
      }
      if (!this.model.get('subject')) {
        this.$el.find('.field[data-name="subject"] input').focus();
        return;
      }
      if (this.model.get('isHtml')) {
        const $div = this.$el.find('.field[data-name="body"] .note-editable');
        if (!$div.length) {
          return;
        }
        $div.focus();
        return;
      }
      this.$el.find('.field[data-name="body"] textarea').prop('selectionEnd', 0).focus();
    }
  }
  var _default = EmailComposeRecordView;
  _exports.default = _default;
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            this.listenTo(this.model, 'change', function (model) {
                if (model.hasChanged('isImportant') || model.hasChanged('inTrash')) {
                    setTimeout(function () {
                        this.reRender();
                    }.bind(this), 10);
                }
            }, this);
        },

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                }
            }];

            if (
                this.model.get('createdById') === this.getUser().id && this.model.get('status') === 'Draft' &&
                !this.model.get('inTrash')
            ) {
                list.push({
                    action: 'send',
                    label: 'Send',
                    data: {
                        id: this.model.id,
                    },
                });
            }

            if (this.options.acl.edit) {
                list = list.concat([
                    {
                        action: 'quickEdit',
                        label: 'Edit',
                        data: {
                            id: this.model.id
                        }
                    }
                ]);
            }

            if (this.model.get('isUsers') && this.model.get('status') !== 'Draft') {
                if (!this.model.get('inTrash')) {
                    list.push({
                        action: 'moveToTrash',
                        label: 'Move to Trash',
                        data: {
                            id: this.model.id
                        }
                    });
                } else {
                    list.push({
                        action: 'retrieveFromTrash',
                        label: 'Retrieve from Trash',
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            if (this.model.get('isUsers')) {
                if (!this.model.get('isImportant')) {
                    if (!this.model.get('inTrash')) {
                        list.push({
                            action: 'markAsImportant',
                            label: 'Mark as Important',
                            data: {
                                id: this.model.id
                            }
                        });
                    }
                } else {
                    list.push({
                        action: 'markAsNotImportant',
                        label: 'Unmark Importance',
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            if (this.model.get('isUsers') && this.model.get('status') !== 'Draft') {
                list.push({
                    action: 'moveToFolder',
                    label: 'Move to Folder',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.delete) {
                list.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id
                    }
                });
            }

            return list;
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/row-actions/dashlet', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:isImportant', () => {
                setTimeout(() => {
                    this.reRender();
                }, 10);
            });
        },

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                }
            }];

            if (this.options.acl.edit) {
                list = list.concat([
                    {
                        action: 'quickEdit',
                        label: 'Edit',
                        data: {
                            id: this.model.id
                        }
                    }
                ]);
            }

            if (this.model.get('isUsers') && this.model.get('status') !== 'Draft') {
                if (!this.model.get('inTrash')) {
                    list.push({
                        action: 'moveToTrash',
                        label: 'Move to Trash',
                        data: {
                            id: this.model.id
                        }
                    });
                } else {
                    list.push({
                        action: 'retrieveFromTrash',
                        label: 'Retrieve from Trash',
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            if (this.getAcl().checkModel(this.model, 'delete')) {
                list.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.model.get('isUsers')) {
                if (!this.model.get('isImportant')) {
                    list.push({
                        action: 'markAsImportant',
                        label: 'Mark as Important',
                        data: {
                            id: this.model.id
                        }
                    });
                } else {
                    list.push({
                        action: 'markAsNotImportant',
                        label: 'Unmark Importance',
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            return list;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/panels/event', ['views/record/panels/side'], function (Dep) {

    return class extends Dep {

        setupFields() {
            super.setupFields();

            this.fieldList.push({
                name: 'icsEventDateStart',
                readOnly: true,
                labelText: this.translate('dateStart', 'fields', 'Meeting'),
            });

            this.fieldList.push({
                name: 'createdEvent',
                readOnly: true,
            });

            this.fieldList.push({
                name: 'createEvent',
                readOnly: true,
                noLabel: true,
            });

            this.controlEventField();

            this.listenTo(this.model, 'change:icsEventData', this.controlEventField, this);
            this.listenTo(this.model, 'change:createdEventId', this.controlEventField, this);
        }

        controlEventField() {
            if (!this.model.get('icsEventData')) {
                this.recordViewObject.hideField('createEvent');
                this.recordViewObject.showField('createdEvent');

                return;
            }

            const eventData = this.model.get('icsEventData');

            if (eventData.createdEvent) {
                this.recordViewObject.hideField('createEvent');
                this.recordViewObject.showField('createdEvent');

                return;
            }

            if (!this.model.get('createdEventId')) {
                this.recordViewObject.hideField('createdEvent');
                this.recordViewObject.showField('createEvent');

                return;
            }

            this.recordViewObject.hideField('createEvent');
            this.recordViewObject.showField('createdEvent');
        }
    };
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/record/panels/default-side', ['views/record/panels/default-side'], function (Dep) {

    return Dep.extend({

        setupFields: function () {
            Dep.prototype.setupFields.call(this);

            this.fieldList.push({
                name: 'hasAttachment',
                view: 'views/email/fields/has-attachment',
                noLabel: true,
            });

            this.controlHasAttachmentField();

            this.listenTo(this.model, 'change:hasAttachment', this.controlHasAttachmentField, this);
        },

        controlHasAttachmentField: function () {
            if (this.model.get('hasAttachment')) {
                this.recordViewObject.showField('hasAttachment');

                return;
            }

            this.recordViewObject.hideField('hasAttachment');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/modals/insert-field',
['views/modal', 'helpers/misc/field-language'], function (Dep, FieldLanguage) {

    return Dep.extend({

        backdrop: true,

        templateContent: `
            {{#each viewObject.dataList}}
                <div class="margin-bottom">
                <h5>{{label}}: {{translate entityType category='scopeNames'}}</h5>
                </div>
                <ul class="list-group no-side-margin">
                    {{#each dataList}}
                    <li class="list-group-item clearfix">
                        <a role="button"
                            data-action="insert" class="text-bold" data-name="{{name}}" data-type="{{../type}}">
                            {{label}}
                        </a>

                        <div class="pull-right"
                            style="width: 50%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                            {{valuePreview}}
                        </div>
                    </li>
                    {{/each}}
                </ul>
            {{/each}}

            {{#unless viewObject.dataList.length}}
                {{translate 'No Data'}}
            {{/unless}}
        `,

        events: {
            'click [data-action="insert"]': function (e) {
                let name = $(e.currentTarget).data('name');
                let type = $(e.currentTarget).data('type');

                this.insert(type, name);
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.headerText = this.translate('Insert Field', 'labels', 'Email');

            this.fieldLanguage = new FieldLanguage(this.getMetadata(), this.getLanguage());

            this.wait(
                Espo.Ajax
                    .getRequest('Email/insertFieldData', {
                        parentId: this.options.parentId,
                        parentType: this.options.parentType,
                        to: this.options.to,
                    })
                    .then(fetchedData => {
                        this.fetchedData = fetchedData;
                        this.prepareData();
                    })
            );
        },

        prepareData: function () {
            this.dataList = [];

            var fetchedData = this.fetchedData;
            var typeList = ['parent', 'to'];

            typeList.forEach(type => {
                if (!fetchedData[type]) {
                    return;
                }

                let entityType = fetchedData[type].entityType;
                let id = fetchedData[type].id;

                for (let it of this.dataList) {
                    if (it.id === id && it.entityType === entityType) {
                        return;
                    }
                }

                var dataList = this.prepareDisplayValueList(fetchedData[type].entityType, fetchedData[type].values);

                if (!dataList.length) {
                    return;
                }

                this.dataList.push({
                    type: type,
                    entityType: entityType,
                    id: id,
                    name: fetchedData[type].name,
                    dataList: dataList,
                    label: this.translate(type, 'fields', 'Email'),
                });
            });
        },

        prepareDisplayValueList: function (scope, values) {
            let list = [];

            let attributeList = Object.keys(values);
            let labels = {};

            attributeList.forEach(item => {
                labels[item] = this.fieldLanguage.translateAttribute(scope, item);
            });

            attributeList = attributeList
                .sort((v1, v2) => {
                    return labels[v1].localeCompare(labels[v2]);
                });

            let ignoreAttributeList = ['id', 'modifiedAt', 'modifiedByName'];

            let fm = this.getFieldManager();

            fm.getEntityTypeFieldList(scope).forEach(field => {
                let type = this.getMetadata().get(['entityDefs', scope, 'fields', field, 'type']);

                if (~['link', 'linkOne', 'image', 'filed', 'linkParent'].indexOf(type)) {
                    ignoreAttributeList.push(field + 'Id');
                }

                if (type === 'linkParent') {
                    ignoreAttributeList.push(field + 'Type');
                }
            });

            attributeList.forEach(item => {
                if (~ignoreAttributeList.indexOf(item)) {
                    return;
                }

                let value = values[item];

                if (value === null || value === '') {
                    return;
                }

                if (typeof value == 'boolean') {
                    return;
                }

                if (Array.isArray(value)) {
                    for (let v in value) {
                        if (typeof v  !== 'string') {
                            return;
                        }
                    }

                    value = value.split(', ');
                }

                value = this.getHelper().sanitizeHtml(value);

                var valuePreview = value.replace(/<br( \/)?>/gm, ' ');

                value = value.replace(/(?:\r\n|\r|\n)/g, '');
                value = value.replace(/<br( \/)?>/gm, '\n');

                list.push({
                    name: item,
                    label: labels[item],
                    value: value,
                    valuePreview: valuePreview,
                });
            });

            return list;
        },

        insert: function (type, name) {
            for (let g of this.dataList) {
                if (g.type !== type) {
                    continue;
                }

                for (let i of g.dataList) {
                    if (i.name !== name) {
                        continue;
                    }

                    this.trigger('insert', i.value);

                    break;
                }

                break;
            }

            this.close();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/modals/detail', ['views/modals/detail', 'views/email/detail'], function (Dep, Detail) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.addButton({
                name: 'reply',
                label: 'Reply',
                hidden: this.model && this.model.get('status') === 'Draft',
                style: 'danger',
                position: 'right',
            }, true)

            if (this.model) {
                this.listenToOnce(this.model, 'sync', () => {
                    setTimeout(() => {
                        this.model.set('isRead', true);
                    }, 50);
                });
            }
        },

        controlRecordButtonsVisibility: function () {
            Dep.prototype.controlRecordButtonsVisibility.call(this);

            if (this.model.get('status') === 'Draft' || !this.getAcl().check('Email', 'create')) {
                this.hideActionItem('reply');

                return;
            }

            this.showActionItem('reply');
        },

        actionReply: function (data, e) {
            Detail.prototype.actionReply.call(this, {}, e, this.getPreferences().get('emailReplyToAllByDefault'));
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/modals/body-plain', ['views/modal'], function (Dep) {

    return Dep.extend({

        backdrop: true,

        templateContent: '<div class="field" data-name="body-plain">{{{bodyPlain}}}</div>',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.buttonList.push({
                'name': 'cancel',
                'label': 'Close'
            });

            this.headerText = this.model.get('name');

            this.createView('bodyPlain', 'views/fields/text', {
                selector: '.field[data-name="bodyPlain"]',
                model: this.model,
                defs: {
                    name: 'bodyPlain',
                    params: {
                        readOnly: true,
                        inlineEditDisabled: true,
                    },
                },
            });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/modals/attachments', ['views/modal'], function (Dep) {

    /**
     * @class
     * @name Class
     * @extends module:views/modal
     * @memberOf module:views/email/modals/attachments
     */
    return Dep.extend(/** @lends module:views/email/modals/attachments.Class# */{

        backdrop: true,

        templateContent: `<div class="record">{{{record}}}</div>`,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.headerText = this.translate('attachments', 'fields', 'Email');

            this.createView('record', 'views/record/detail', {
                model: this.model,
                selector: '.record',
                readOnly: true,
                sideView: null,
                buttonsDisabled: true,
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'attachments',
                                    noLabel: true,
                                },
                                false,
                            ]
                        ]
                    }
                ],
            });

            if (!this.model.has('attachmentsIds')) {
                this.wait(
                    this.model.fetch()
                );
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/subject', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        listLinkTemplate: 'email/fields/subject/list-link',

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.isRead = (this.model.get('sentById') === this.getUser().id) || this.model.get('isRead');
            data.isImportant = this.model.has('isImportant') && this.model.get('isImportant');
            data.hasAttachment = this.model.has('hasAttachment') && this.model.get('hasAttachment');
            data.isReplied = this.model.has('isReplied') && this.model.get('isReplied');
            data.inTrash = this.model.has('inTrash') && this.model.get('inTrash');

            if (!data.isRead && !this.model.has('isRead')) {
                data.isRead = true;
            }

            if (!data.isNotEmpty) {
                if (
                    this.model.get('name') !== null &&
                    this.model.get('name') !== '' &&
                    this.model.has('name')
                ) {
                    data.isNotEmpty = true;
                }
            }

            return data;
        },

        getValueForDisplay: function () {
            return this.model.get('name');
        },

        getAttributeList: function () {
            return ['name', 'subject', 'isRead', 'isImportant', 'hasAttachment', 'inTrash'];
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events['click [data-action="showAttachments"]'] = e => {
                e.stopPropagation();

                this.showAttachments();
            }

            this.listenTo(this.model, 'change', () => {
                if (this.mode === 'list' || this.mode === 'listLink') {
                    if (this.model.hasChanged('isRead') || this.model.hasChanged('isImportant')) {
                        this.reRender();
                    }
                }
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);
            data.name = data.subject;
            return data;
        },

        showAttachments: function () {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'views/email/modals/attachments', {model: this.model})
                .then(view => {
                    view.render();

                    Espo.Ui.notify(false);
                });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/select-template', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        type: 'link',

        foreignScope: 'EmailTemplate',

        editTemplate: 'email/fields/select-template/edit',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('change', () => {
                let id = this.model.get(this.idName);

                if (id) {
                    this.loadTemplate(id);
                }
            });
        },

        getSelectPrimaryFilterName: function () {
            return 'actual';
        },

        loadTemplate: function (id) {
            let to = this.model.get('to') || '';
            let emailAddress = null;

            to = to.trim();

            if (to) {
                emailAddress = to.split(';')[0].trim();
            }

            Espo.Ajax
                .postRequest(`EmailTemplate/${id}/prepare`, {
                    emailAddress: emailAddress,
                    parentType: this.model.get('parentType'),
                    parentId: this.model.get('parentId'),
                    relatedType: this.model.get('relatedType'),
                    relatedId: this.model.get('relatedId'),
                })
                .then(data => {
                    this.model.trigger('insert-template', data);

                    this.emptyField();
                })
                .catch(() => {
                    this.emptyField();
                });
        },

        emptyField: function () {
            this.model.set(this.idName, null);
            this.model.set(this.nameName, '');
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/replies', ['views/fields/link-multiple'], function (Dep) {

    return Dep.extend({

        getAttributeList: function () {
            let attributeList = Dep.prototype.getAttributeList.call(this);

            attributeList.push(this.name + 'Columns');

            return attributeList;
        },

        getDetailLinkHtml: function (id) {
            let html = Dep.prototype.getDetailLinkHtml.call(this, id);

            let columns = this.model.get(this.name + 'Columns') || {};

            let status = (columns[id] || {})['status'];

            return $('<div>')
                .append(
                    $('<span>')
                        .addClass('fas fa-arrow-right fa-sm link-multiple-item-icon')
                        .addClass(status === 'Draft' ? 'text-warning' : 'text-success')
                )
                .append(html)
                .html();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/replied', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === 'detail') {
                var $a = this.$el.find('a');
                if ($a.get(0)) {
                    $(
                        '<span class="fas fa-arrow-left fa-sm link-field-icon text-soft"></span>'
                    ).insertBefore($a);
                }
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/person-string-data-for-expanded', ['views/email/fields/person-string-data'], function (Dep) {

    return Dep.extend({

        listTemplate: 'email/fields/person-string-data/list-for-expanded',

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/icon', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        listTemplate: 'email/fields/icon/detail',

        detailTemplate: 'email/fields/icon/detail',
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/has-attachment', ['views/fields/base'], function (Dep) {

    /**
     * @class
     * @name Class
     * @extends module:views/fields/base
     * @memberOf module:views/email/fields/has-attachment
     */
    return Dep.extend(/** @lends module:views/email/fields/has-attachment.Class# */{

        listTemplate: 'email/fields/has-attachment/detail',
        detailTemplate: 'email/fields/has-attachment/detail',

        events: {
            'click [data-action="show"]': function (e) {
                e.stopPropagation();

                this.show();
            },
        },

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.isSmall = this.mode === this.MODE_LIST;

            return data;
        },

        show: function () {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'views/email/modals/attachments', {model: this.model})
                .then(view => {
                    view.render();

                    Espo.Ui.notify(false);
                });
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/from-email-address', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        listTemplate: 'email/fields/from-email-address/detail',

        detailTemplate: 'email/fields/from-email-address/detail',
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/email-address-varchar',
['views/fields/base', 'views/email/fields/from-address-varchar', 'views/email/fields/email-address'],
function (Dep, From, EmailAddress) {

    return Dep.extend({

        detailTemplate: 'email/fields/email-address-varchar/detail',
        editTemplate: 'email/fields/email-address-varchar/edit',

        emailAddressRegExp: new RegExp(
            /^[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+(?:\.[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+)*/.source +
            /@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]/.source
        ),

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.valueIsSet = this.model.has(this.name);
            data.maxLength = 254;

            return data;
        },

        events: {
            'click a[data-action="clearAddress"]': function (e) {
                let address = $(e.currentTarget).data('address').toString();

                this.deleteAddress(address);
            },
            'keyup input': function (e) {
                if (!this.isEditMode()) {
                    return;
                }

                let key = Espo.Utils.getKeyFromKeyEvent(e);

                if (
                    key === 'Comma' ||
                    key === 'Semicolon' ||
                    key === 'Enter'
                ) {
                    let $input = $(e.currentTarget);
                    let address = $input.val().replace(',', '').replace(';', '').trim();

                    if (address.indexOf('@') === -1) {
                        return;
                    }

                    if (this.checkEmailAddressInString(address)) {
                        this.addAddress(address, '');
                        $input.val('');
                    }
                }
            },
            'change input': function (e) {
                if (!this.isEditMode()) {
                    return;
                }

                let $input = $(e.currentTarget);
                let address = $input.val().replace(',','').replace(';','').trim();

                if (address.indexOf('@') === -1) {
                    return;
                }

                if (this.checkEmailAddressInString(address)) {
                    this.addAddress(address, '');

                    $input.val('');
                }
            },
            'click [data-action="createContact"]': function (e) {
                let address = $(e.currentTarget).data('address');

                From.prototype.createPerson.call(this, 'Contact', address);
            },
            'click [data-action="createLead"]': function (e) {
                let address = $(e.currentTarget).data('address');

                From.prototype.createPerson.call(this, 'Lead', address);
            },
            'click [data-action="addToContact"]': function (e) {
                let address = $(e.currentTarget).data('address');

                From.prototype.addToPerson.call(this, 'Contact', address);
            },
            'click [data-action="addToLead"]': function (e) {
                let address = $(e.currentTarget).data('address');

                From.prototype.addToPerson.call(this, 'Lead', address);
            },
            'auxclick a[href][data-scope][data-id]': function (e) {
                let isCombination = e.button === 1 && (e.ctrlKey || e.metaKey);

                if (!isCombination) {
                    return;
                }

                let $target = $(e.currentTarget);

                let id = $target.attr('data-id');
                let scope = $target.attr('data-scope');

                e.preventDefault();
                e.stopPropagation();

                From.prototype.quickView.call(this, {
                    id: id,
                    scope: scope,
                });
            },
        },

        getAutocompleteMaxCount: function () {
            if (this.autocompleteMaxCount) {
                return this.autocompleteMaxCount;
            }

            return this.getConfig().get('recordsPerPage');
        },

        parseNameFromStringAddress: function (s) {
            return From.prototype.parseNameFromStringAddress.call(this, s);
        },

        getAttributeList: function () {
            var list = Dep.prototype.getAttributeList.call(this);

            list.push('nameHash');
            list.push('typeHash');
            list.push('idHash');
            list.push('accountId');
            list.push(this.name + 'EmailAddressesNames');
            list.push(this.name + 'EmailAddressesIds');

            return list;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.on('render', () => {
                this.initAddressList();
            });
        },

        initAddressList: function () {
            this.nameHash = {};

            this.addressList = (this.model.get(this.name) || '')
                .split(';')
                .filter((item) => {
                    return item !== '';
                })
                .map(item => {
                    return item.trim();
                });

            this.idHash = this.idHash || {};
            this.typeHash = this.typeHash || {};
            this.nameHash = this.nameHash || {};

            _.extend(this.typeHash, this.model.get('typeHash') || {});
            _.extend(this.nameHash, this.model.get('nameHash') || {});
            _.extend(this.idHash, this.model.get('idHash') || {});

            this.nameHash = _.clone(this.nameHash);
            this.typeHash = _.clone(this.typeHash);
            this.idHash = _.clone(this.idHash);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode()) {
                this.$input = this.$element = this.$el.find('input');

                this.addressList.forEach(item => {
                    this.addAddressHtml(item, this.nameHash[item] || '');
                });

                this.$input.autocomplete({
                    serviceUrl: () => {
                        return `EmailAddress/search` +
                            `?maxSize=${this.getAutocompleteMaxCount()}` +
                            `&onlyActual=true`;
                    },
                    paramName: 'q',
                    minChars: 1,
                    autoSelectFirst: true,
                    noCache: true,
                    triggerSelectOnValidInput: false,
                    beforeRender: () => {
                        // Prevent an issue that suggestions are shown and not hidden
                        // when clicking outside the window and then focusing back on the document.
                        if (this.$input.get(0) !== document.activeElement) {
                            setTimeout(() => this.$input.autocomplete('hide'), 30);
                        }
                    },
                    formatResult: (suggestion) => {
                        return this.getHelper().escapeString(suggestion.name) + ' &#60;' +
                            this.getHelper().escapeString(suggestion.id) + '&#62;';
                    },
                    transformResult: (response) => {
                        response = JSON.parse(response);
                        var list = [];

                        response.forEach((item) => {
                            list.push({
                                id: item.emailAddress,
                                name: item.entityName,
                                emailAddress: item.emailAddress,
                                entityId: item.entityId,
                                entityName: item.entityName,
                                entityType: item.entityType,
                                data: item.emailAddress,
                                value: item.emailAddress,
                            });
                        });

                        return {
                            suggestions: list
                        };
                    },
                    onSelect: (s) => {
                        this.addAddress(s.emailAddress, s.entityName, s.entityType, s.entityId);

                        this.$input.val('');
                        this.$input.focus();
                    },
                });

                this.once('render', () => {
                    this.$input.autocomplete('dispose');
                });

                this.once('remove', () => {
                    this.$input.autocomplete('dispose');
                });
            }

            if (this.mode === 'search' && this.getAcl().check('Email', 'create')) {
                EmailAddress.prototype.initSearchAutocomplete.call(this);
            }

            if (this.mode === 'search') {
                this.$input.on('input', () => {
                    this.trigger('change');
                });
            }
        },

        checkEmailAddressInString: function (string) {
            var arr = string.match(this.emailAddressRegExp);

            if (!arr || !arr.length) {
                return;
            }

            return true;
        },

        addAddress: function (address, name, type, id) {
            if (this.justAddedAddress) {
                this.deleteAddress(this.justAddedAddress);
            }

            this.justAddedAddress = address;

            setTimeout(() => {
                this.justAddedAddress = null;
            }, 100);

            address = address.trim();

            if (!type) {
                var arr = address.match(this.emailAddressRegExp);

                if (!arr || !arr.length) {
                    return;
                }

                address = arr[0];
            }

            if (!~this.addressList.indexOf(address)) {
                this.addressList.push(address);
                this.nameHash[address] = name;

                if (type) {
                    this.typeHash[address] = type;
                }

                if (id) {
                    this.idHash[address] = id;
                }

                this.addAddressHtml(address, name);
                this.trigger('change');
            }
        },

        addAddressHtml: function (address, name) {
            let $container = this.$el.find('.link-container');

            let $text = $('<span>');

            if (name) {
                $text.append(
                    $('<span>').text(name),
                    ' ',
                    $('<span>').addClass('text-muted chevron-right'),
                    ' '
                );
            }

            $text.append(
                $('<span>').text(address)
            );

            let $div = $('<div>')
                .attr('data-address', address)
                .addClass('list-group-item')
                .append(
                    $('<a>')
                        .attr('data-address', address)
                        .attr('role', 'button')
                        .attr('tabindex', '0')
                        .attr('data-action', 'clearAddress')
                        .addClass('pull-right')
                        .append(
                            $('<span>').addClass('fas fa-times')
                        ),
                    $text
                );

            $container.append($div);
        },

        deleteAddress: function (address) {
            this.deleteAddressHtml(address);

            var index = this.addressList.indexOf(address);

            if (index > -1) {
                this.addressList.splice(index, 1);
            }

            delete this.nameHash[address];

            this.trigger('change');
        },

        deleteAddressHtml: function (address) {
            this.$el.find('.list-group-item[data-address="' + address + '"]').remove();
        },

        fetch: function () {
            let data = {};

            data[this.name] = this.addressList.join(';');

            return data;
        },

        fetchSearch: function () {
            let value = this.$element.val().trim();

            if (value) {
                return {
                    type: 'equals',
                    value: value,
                };
            }

            return null;
        },

        getValueForDisplay: function () {
            if (this.isDetailMode()) {
                let names = [];

                this.addressList.forEach((address) => {
                    names.push(this.getDetailAddressHtml(address));
                });

                return names.join('');
            }
        },

        getDetailAddressHtml: function (address) {
            if (!address) {
                return '';
            }

            let name = this.nameHash[address] || null;
            let entityType = this.typeHash[address] || null;
            let id = this.idHash[address] || null;

            if (id) {
                return $('<div>')
                    .append(
                        $('<a>')
                            .attr('href', '#' + entityType + '/view/' + id)
                            .attr('data-scope', entityType)
                            .attr('data-id', id)
                            .text(name),
                        ' <span class="text-muted chevron-right"></span> ',
                        $('<span>').text(address)
                    )
                    .get(0).outerHTML;
            }

            let $div = $('<div>');

            if (name) {
                $div.append(
                    $('<span>')
                        .addClass('email-address-line')
                        .text(name)
                        .append(' <span class="text-muted chevron-right"></span> ')
                        .append(
                            $('<span>').text(address)
                        )
                );
            }
            else {
                $div.append(
                    $('<span>')
                        .addClass('email-address-line')
                        .text(address)
                );
            }

            if (this.getAcl().check('Contact', 'create') || this.getAcl().check('Lead', 'create')) {
                $div.prepend(
                    From.prototype.getCreateHtml.call(this, address)
                );
            }

            return $div.get(0).outerHTML;
        },

        validateRequired: function () {
            if (this.model.get('status') === 'Draft') {
                return false;
            }

            return Dep.prototype.validateRequired.call(this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/created-event', ['views/fields/link-parent'], function (Dep) {

    return class extends Dep {

        data() {
            let data = super.data();

            let icsEventData = this.model.get('icsEventData') || {};

            if (
                this.isReadMode() &&
                !data.idValue &&
                icsEventData.createdEvent
            ) {
                data.idValue = icsEventData.createdEvent.id;
                data.typeValue = icsEventData.createdEvent.entityType;
                data.nameValue = icsEventData.createdEvent.name;
            }

            return data;
        }

        getAttributeList() {
            let list = super.getAttributeList();

            list.push('icsEventData');

            return list;
        }
    };
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/create-event', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'email/fields/create-event/detail',

        eventEntityType: 'Meeting',

        getAttributeList: function () {
            return [
                'icsEventData',
                'createdEventId',
            ];
        },

        events: {
            'click [data-action="createEvent"]': function () {
                this.createEvent();
            },
        },

        createEvent: function () {
            let viewName = this.getMetadata().get(['clientDefs', this.eventEntityType, 'modalViews', 'edit']) ||
                'views/modals/edit';

            let eventData = this.model.get('icsEventData') || {};

            let attributes = Espo.Utils.cloneDeep(eventData.valueMap || {});

            attributes.parentId = this.model.get('parentId');
            attributes.parentType = this.model.get('parentType');
            attributes.parentName = this.model.get('parentName');

            this.addFromAddressToAttributes(attributes);

            this.createView('dialog', viewName, {
                attributes: attributes,
                scope: this.eventEntityType,
            })
                .then(view => {
                    view.render();

                    this.listenToOnce(view, 'after:save', () => {
                        this.model
                            .fetch()
                            .then(() =>
                                Espo.Ui.success(this.translate('Done'))
                            );
                    });
                });
        },

        addFromAddressToAttributes: function (attributes) {
            let fromAddress = this.model.get('from');
            let idHash = this.model.get('idHash') || {};
            let typeHash = this.model.get('typeHash') || {};
            let nameHash = this.model.get('nameHash') || {};

            let fromId = null;
            let fromType = null;
            let fromName = null;

            if (!fromAddress) {
                return;
            }

            fromId = idHash[fromAddress] || null;
            fromType = typeHash[fromAddress] || null;
            fromName = nameHash[fromAddress] || null;

            let attendeeLink = this.getAttendeeLink(fromType);

            if (!attendeeLink) {
                return;
            }

            attributes[attendeeLink + 'Ids'] = attributes[attendeeLink + 'Ids'] || [];
            attributes[attendeeLink + 'Names'] = attributes[attendeeLink + 'Names'] || {};

            if (~attributes[attendeeLink + 'Ids'].indexOf(fromId)) {
                return;
            }

            attributes[attendeeLink + 'Ids'].push(fromId);
            attributes[attendeeLink + 'Names'][fromId] = fromName;
        },

        getAttendeeLink: function (entityType) {
            if (entityType === 'User') {
                return 'users';
            }

            if (entityType === 'Contact') {
                return 'contacts';
            }

            if (entityType === 'Lead') {
                return 'leads';
            }

            return null;
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/compose-from-address', ['views/fields/base', 'ui/select'],
function (Dep, /** module:ui/select*/Select) {

    return Dep.extend({

        detailTemplate: 'email/fields/email-address-varchar/detail',
        editTemplate: 'email/fields/compose-from-address/edit',

        data: function () {
            let noSmtpMessage = this.translate('noSmtpSetup', 'messages', 'Email');

            let linkHtml = $('<a>')
                    .attr('href', '#EmailAccount')
                    .text(this.translate('EmailAccount', 'scopeNamesPlural'))
                    .get(0).outerHTML;

            noSmtpMessage = noSmtpMessage.replace('{link}', linkHtml);

            return {
                list: this.list,
                noSmtpMessage: noSmtpMessage,
                ...Dep.prototype.data.call(this),
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.nameHash = {...(this.model.get('nameHash') || {})};
            this.typeHash = this.model.get('typeHash') || {};
            this.idHash = this.model.get('idHash') || {};

            this.list = this.getUser().get('emailAddressList') || [];
        },

        afterRenderEdit: function () {
            if (this.$element.length) {
                Select.init(this.$element);
            }
        },

        getValueForDisplay: function () {
            if (this.isDetailMode()) {
                let address = this.model.get(this.name);

                return this.getDetailAddressHtml(address);
            }

            return Dep.prototype.getValueForDisplay.call(this);
        },

        getDetailAddressHtml: function (address) {
            if (!address) {
                return '';
            }

            let name = this.nameHash[address] || null;

            let entityType = this.typeHash[address] || null;
            let id = this.idHash[address] || null;

            if (id && name) {
                return $('<div>')
                    .append(
                        $('<a>')
                            .attr('href', `#${entityType}/view/${id}`)
                            .attr('data-scope', entityType)
                            .attr('data-id', id)
                            .text(name),
                        ' ',
                        $('<span>').addClass('text-muted chevron-right'),
                        ' ',
                        $('<span>').text(address)
                    )
                    .get(0).outerHTML;
            }

            let $div = $('<div>');

            if (name) {
                $div.append(
                    $('<span>')
                        .addClass('email-address-line')
                        .text(name)
                        .append(
                            ' ',
                            $('<span>').addClass('text-muted chevron-right'),
                            ' ',
                            $('<span>').text(address)
                        )
                );

                return $div.get(0).outerHTML;
            }

            $div.append(
                $('<span>')
                    .addClass('email-address-line')
                    .text(address)
            )

            return $div.get(0).outerHTML;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/fields/body', ['views/fields/wysiwyg'], function (Dep) {

    return Dep.extend({

        useIframe: true,

        getAttributeList: function () {
            return ['body', 'bodyPlain'];
        },

        setupToolbar: function () {
            Dep.prototype.setupToolbar.call(this);

            this.toolbar.unshift([
                'insert-field',
                ['insert-field']
            ]);

            this.buttons['insert-field'] = function (context) {
                var ui = $.summernote.ui;
                var button = ui.button({
                    contents: '<i class="fas fa-plus"></i>',
                    tooltip: this.translate('Insert Field', 'labels', 'Email'),
                    click: function () {
                        this.showInsertFieldModal();
                    }.bind(this)
                });
                return button.render();
            }.bind(this);

            this.listenTo(this.model, 'change', function (m) {
                if (!this.isRendered()) return;
                if (m.hasChanged('parentId') || m.hasChanged('to')) {
                    this.controInsertFieldButton();
                }
            }, this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.controInsertFieldButton();
        },

        controInsertFieldButton: function () {
            var $b = this.$el.find('.note-insert-field > button');

            if (this.model.get('to') && this.model.get('to').length || this.model.get('parentId')) {
                $b.removeAttr('disabled').removeClass('disabled');
            } else {
                $b.attr('disabled', 'disabled').addClass('disabled');
            }
        },

        showInsertFieldModal: function () {
            var to = this.model.get('to');
            if (to) {
                to = to.split(';')[0].trim();
            }
            var parentId = this.model.get('parentId');
            var parentType = this.model.get('parentType');

            Espo.Ui.notify(' ... ');

            this.createView('insertFieldDialog', 'views/email/modals/insert-field', {
                parentId: parentId,
                parentType: parentType,
                to: to,
            }, function (view) {
                view.render();
                Espo.Ui.notify();

                this.listenToOnce(view, 'insert', function (string) {
                    if (this.$summernote) {
                        if (~string.indexOf('\n')) {
                            string = string.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            var html = '<p>' + string + '</p>';
                            this.$summernote.summernote('editor.pasteHTML', html);
                        } else {
                            this.$summernote.summernote('editor.insertText', string);
                        }
                    }
                    this.clearView('insertFieldDialog');
                }, this);
            });
        },

    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/dashboard-template/detail', ['views/detail'], function (Dep) {

    return Dep.extend({

        actionDeployToUsers: function () {
            this.createView('dialog', 'views/dashboard-template/modals/deploy-to-users', {
                model: this.model,
            }, function (view) {
                view.render();
            }, this);
        },

        actionDeployToTeam: function () {
            this.createView('dialog', 'views/dashboard-template/modals/deploy-to-team', {
                model: this.model,
            }, function (view) {
                view.render();
            }, this);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/dashboard-template/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        massActionList: ['remove', 'export'],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/dashboard-template/modals/deploy-to-users', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        className: 'dialog dialog-record',

        templateContent: '<div class="record">{{{record}}}</div>',

        setup: function () {
            this.buttonList = [
                {
                    name: 'deploy',
                    text: this.translate('Deploy for Users', 'labels', 'DashboardTemplate'),
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerText = this.model.get('name');

            this.formModel = new Model();
            this.formModel.name = 'None';

            this.formModel.setDefs({
                fields: {
                    'users': {
                        type: 'linkMultiple',
                        view: 'views/fields/users',
                        entity: 'User',
                        required: true
                    },
                    'append': {
                        type: 'bool'
                    },
                }
            });

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'None',
                model: this.formModel,
                selector: '.record',
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'users',
                                    labelText: this.translate('users', 'links'),
                                },
                                {
                                    name: 'append',
                                    labelText: this.translate('append', 'fields', 'DashboardTemplate'),
                                }
                            ]
                        ]
                    }
                ],
            });
        },

        actionDeploy: function () {
            if (this.getView('record').processFetch()) {
                Espo.Ajax
                    .postRequest('DashboardTemplate/action/deployToUsers', {
                        id: this.model.id,
                        userIdList: this.formModel.get('usersIds'),
                        append: this.formModel.get('append'),
                    })
                    .then(() => {
                        Espo.Ui.success(this.translate('Done'));
                        this.close();
                    });
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/dashboard-template/modals/deploy-to-team', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        className: 'dialog dialog-record',

        templateContent: '<div class="record">{{{record}}}</div>',

        setup: function () {
            this.buttonList = [
                {
                    name: 'deploy',
                    text: this.translate('Deploy for Team', 'labels', 'DashboardTemplate'),
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ];

            this.headerText = this.model.get('name');

            this.formModel = new Model();
            this.formModel.name = 'None';

            this.formModel.setDefs({
                fields: {
                    'team': {
                        type: 'link',
                        entity: 'Team',
                        required: true
                    },
                    'append': {
                        type: 'bool'
                    },
                }
            });

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'None',
                model: this.formModel,
                selector: '.record',
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'team',
                                    labelText: this.translate('team', 'links'),
                                },
                                {
                                    name: 'append',
                                    labelText: this.translate('append', 'fields', 'DashboardTemplate'),
                                },
                            ]
                        ]
                    }
                ],
            });
        },

        actionDeploy: function () {
            if (this.getView('record').processFetch()) {
                Espo.Ajax
                    .postRequest('DashboardTemplate/action/deployToTeam', {
                        id: this.model.id,
                        teamId: this.formModel.get('teamId'),
                        append: this.formModel.get('append'),
                    })
                    .then(() => {
                        Espo.Ui.success(this.translate('Done'));
                        this.close();
                    });
            }
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/record/row-actions/view-and-remove',
        massActionList: ['remove'],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        readOnly: true,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/modals/select-one', ['views/modal'], function (Dep) {

    return Dep.extend({

        backdrop: true,

        // language=Handlebars
        templateContent:
            '<ul class="list-group no-side-margin">{{#each viewObject.options.dataList}}'+
            '<li class="list-group-item">'+
            '<a role="button" class="action" data-action="select" data-id="{{id}}">{{name}}</a>'+
            '</li>'+
            '{{/each}}</ul>',

        setup: function () {
            this.headerText = this.translate('Select');

            if (this.options.fieldLabel) {
                this.headerText += ': ' + this.options.fieldLabel;
            }
        },

        actionSelect: function (data) {
            this.trigger('select', data.id);
            this.remove();
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        editDisabled: true,
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/fields/parent', ['views/fields/link-parent'], function (Dep) {

    return Dep.extend({

        ignoreScopeList: [
            'Preferences',
            'ExternalAccount',
            'Notification',
            'Note',
            'ArrayValue',
            'Attachment',
        ],

        displayEntityType: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.foreignScopeList = this.getMetadata().getScopeEntityList().filter(item => {
                if (!this.getUser().isAdmin()) {
                    if (!this.getAcl().checkScopeHasAcl(item)) {
                        return;
                    }
                }

                if (~this.ignoreScopeList.indexOf(item)) {
                    return;
                }

                if (!this.getAcl().checkScope(item)) {
                    return;
                }

                return true;
            });

            this.getLanguage().sortEntityList(this.foreignScopeList);

            this.foreignScope = this.model.get(this.typeName) || this.foreignScopeList[0];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/attachment/fields/name', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'attachment/fields/name/detail',

        data: function () {
            var data = Dep.prototype.data.call(this);

            var url = this.getBasePath() + '?entryPoint=download&id=' + this.model.id;

            if (this.getUser().get('portalId')) {
                url += '&portalId=' + this.getUser().get('portalId');
            }

            data.url = url;

            return data;
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/api-user/list', ['views/list'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        getCreateAttributes: function () {
            return {
                type: 'api',
            };
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/address-map/view', ['views/main'], function (Dep) {

    return Dep.extend({

        templateContent: `
            <div class="header page-header">{{{header}}}</div>
            <div class="map-container">{{{map}}}</div>
        `,

        setup: function () {
            this.scope = this.model.entityType;

            this.createView('header', 'views/header', {
                model: this.model,
                fullSelector: '#main > .header',
                scope: this.model.entityType,
                fontSizeFlexible: true,
            });
        },

        afterRender: function () {
        	var field = this.options.field;

            var viewName = this.model.getFieldParam(field + 'Map', 'view') ||
                this.getFieldManager().getViewName('map');

            this.createView('map', viewName, {
                model: this.model,
                name: field + 'Map',
                selector: '.map-container',
                height: this.getHelper().calculateContentContainerHeight(this.$el.find('.map-container')),
            }, (view) => {
            	view.render();
            });
        },

        getHeader: function () {
            let name = this.model.get('name');

            if (!name) {
                name = this.model.id;
            }

            let recordUrl = '#' + this.model.entityType + '/view/' + this.model.id
            let scopeLabel = this.getLanguage().translate(this.model.entityType, 'scopeNamesPlural');
            let fieldLabel = this.translate(this.options.field, 'fields', this.model.entityType);
            let rootUrl = this.options.rootUrl ||
                this.options.params.rootUrl ||
                '#' + this.model.entityType;

            let $name = $('<a>')
                .attr('href', recordUrl)
                .append(
                    $('<span>')
                    .addClass('font-size-flexible title')
                    .text(name)
                );

            if (this.model.get('deleted')) {
                $name.css('text-decoration', 'line-through');
            }

            let $root = $('<span>')
                .append(
                    $('<a>')
                        .attr('href', rootUrl)
                        .addClass('action')
                        .attr('data-action', 'navigateToRoot')
                        .text(scopeLabel)
                );

            let headerIconHtml = this.getHeaderIconHtml();

            if (headerIconHtml) {
                $root.prepend(headerIconHtml);
            }

            let $field = $('<span>').text(fieldLabel)

            return this.buildHeaderHtml([
                $root,
                $name,
                $field,
            ]);
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/action-history-record/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/record/row-actions/view-and-remove',

        massActionList: ['remove', 'export'],
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/action-history-record/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({

        fullFormDisabled: true,

        editDisabled: true,

        sideDisabled: true,
    });
});


/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/action-history-record/fields/target', ['views/fields/link-parent'], function (Dep) {

    return Dep.extend({

        displayScopeColorInListMode: true,

        ignoreScopeList: ['Preferences', 'ExternalAccount', 'Notification', 'Note', 'ArrayValue'],

        setup: function () {
            Dep.prototype.setup.call(this);

            this.foreignScopeList = this.getMetadata().getScopeEntityList().filter(item => {
                if (!this.getUser().isAdmin()) {
                    if (!this.getAcl().checkScopeHasAcl(item)) {
                        return;
                    }
                }

                if (~this.ignoreScopeList.indexOf(item)) {
                    return;
                }

                if (!this.getAcl().checkScope(item)) {
                    return;
                }

                return true;
            });

            this.getLanguage().sortEntityList(this.foreignScopeList);

            this.foreignScope = this.model.get(this.typeName) || this.foreignScopeList[0];
        },
    });
});

/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/action-history-record/fields/target-type', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);
            this.params.options = this.getMetadata().getScopeEntityList();
        },
    });
});

define("helpers/misc/list-select-attributes", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /** @module helpers/misc/stored-text-search */

  class _default {
    /**
     * @param {module:storage} storage
     * @param {string} scope
     * @param {Number} [maxCount]
     */
    constructor(scope, storage, maxCount) {
      this.scope = scope;
      this.storage = storage;
      this.key = 'textSearches';
      this.maxCount = maxCount || 100;
      /** @type {string[]|null} */
      this.list = null;
    }

    /**
     * Match.
     *
     * @param {string} text
     * @param {Number} [limit]
     * @return {string[]}
     */
    match(text, limit) {
      text = text.toLowerCase().trim();
      const list = this.get();
      const matchedList = [];
      for (const item of list) {
        if (item.toLowerCase().startsWith(text)) {
          matchedList.push(item);
        }
        if (limit !== undefined && matchedList.length === limit) {
          break;
        }
      }
      return matchedList;
    }

    /**
     * Get stored text filters.
     *
     * @private
     * @return {string[]}
     */
    get() {
      if (this.list === null) {
        this.list = this.getFromStorage();
      }
      return this.list;
    }

    /**
     * @private
     * @return {string[]}
     */
    getFromStorage() {
      /** @var {string[]} */
      return this.storage.get(this.key, this.scope) || [];
    }

    /**
     * Store a text filter.
     *
     * @param {string} text
     */
    store(text) {
      text = text.trim();
      let list = this.getFromStorage();
      const index = list.indexOf(text);
      if (index !== -1) {
        list.splice(index, 1);
      }
      list.unshift(text);
      if (list.length > this.maxCount) {
        list = list.slice(0, this.maxCount);
      }
      this.list = list;
      this.storage.set(this.key, this.scope, list);
    }

    /**
     * Remove a text filter.
     *
     * @param {string} text
     */
    remove(text) {
      text = text.trim();
      const list = this.getFromStorage();
      const index = list.indexOf(text);
      if (index === -1) {
        return;
      }
      list.splice(index, 1);
      this.list = list;
      this.storage.set(this.key, this.scope, list);
    }
  }
  _exports.default = _default;
});

define("handlers/working-time-range", ["exports", "bullbone"], function (_exports, _bullbone) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  /**
   * @mixes Bull.Events
   */
  class WorkingTimeRangeHandler {
    constructor(view) {
      /** @type {module:views/record/edit} */
      this.view = view;
    }
    process() {
      this.listenTo(this.view.model, 'change:dateStart', (model, value, o) => {
        if (!o.ui || model.get('dateEnd')) {
          return;
        }
        setTimeout(() => model.set('dateEnd', value), 50);
      });
    }
  }
  Object.assign(WorkingTimeRangeHandler.prototype, _bullbone.Events);
  var _default = WorkingTimeRangeHandler;
  _exports.default = _default;
});

define("handlers/import", ["exports", "action-handler"], function (_exports, _actionHandler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _actionHandler = _interopRequireDefault(_actionHandler);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class ImportHandler extends _actionHandler.default {
    // noinspection JSUnusedGlobalSymbols
    actionErrorExport() {
      Espo.Ajax.postRequest(`Import/${this.view.model.id}/exportErrors`).then(data => {
        if (!data.attachmentId) {
          const message = this.view.translate('noErrors', 'messages', 'Import');
          Espo.Ui.warning(message);
          return;
        }
        window.location = this.view.getBasePath() + '?entryPoint=download&id=' + data.attachmentId;
      });
    }
  }
  var _default = ImportHandler;
  _exports.default = _default;
});

define("handlers/email-filter", ["exports", "dynamic-handler"], function (_exports, _dynamicHandler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _dynamicHandler = _interopRequireDefault(_dynamicHandler);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailFilterHandler extends _dynamicHandler.default {
    init() {
      if (this.model.isNew()) {
        if (!this.recordView.getUser().isAdmin()) {
          this.recordView.hideField('isGlobal');
        }
      }
      if (!this.model.isNew() && !this.recordView.getUser().isAdmin() && !this.model.get('isGlobal')) {
        this.recordView.hideField('isGlobal');
      }
      if (this.model.isNew() && !this.model.get('parentId')) {
        this.model.set('parentType', 'User');
        this.model.set('parentId', this.recordView.getUser().id);
        this.model.set('parentName', this.recordView.getUser().get('name'));
        if (!this.recordView.getUser().isAdmin()) {
          this.recordView.setFieldReadOnly('parent');
        }
      } else if (this.model.get('parentType') && !this.recordView.options.duplicateSourceId) {
        this.recordView.setFieldReadOnly('parent');
        this.recordView.setFieldReadOnly('isGlobal');
      }
      this.recordView.listenTo(this.model, 'change:isGlobal', (model, value, o) => {
        if (!o.ui) {
          return;
        }
        if (value) {
          this.model.set({
            action: 'Skip',
            parentName: null,
            parentType: null,
            parentId: null,
            emailFolderId: null,
            groupEmailFolderId: null,
            markAsRead: false
          });
        }
      });
      this.recordView.listenTo(this.model, 'change:parentType', (model, value, o) => {
        if (!o.ui) {
          return;
        }

        // Avoiding side effects.
        setTimeout(() => {
          if (value !== 'User') {
            this.model.set('markAsRead', false);
          }
          if (value === 'EmailAccount') {
            this.model.set('action', 'Skip');
            this.model.set('emailFolderId', null);
            this.model.set('groupEmailFolderId', null);
            this.model.set('markAsRead', false);
            return;
          }
          if (value !== 'InboundEmail') {
            if (this.model.get('action') === 'Move to Group Folder') {
              this.model.set('action', 'Skip');
            }
            this.model.set('groupEmailFolderId', null);
            return;
          }
          if (value !== 'User') {
            if (this.model.get('action') === 'Move to Folder') {
              this.model.set('action', 'Skip');
            }
            this.model.set('groupFolderId', null);
          }
        }, 40);
      });
    }
  }
  var _default = EmailFilterHandler;
  _exports.default = _default;
});

define("handlers/select-related/same-account", ["exports", "handlers/select-related"], function (_exports, _selectRelated) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _selectRelated = _interopRequireDefault(_selectRelated);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class SameAccountSelectRelatedHandler extends _selectRelated.default {
    /**
     * @param {module:model} model
     * @return {Promise<module:handlers/select-related~filters>}
     */
    getFilters(model) {
      const advanced = {};
      let accountId = null;
      let accountName = null;
      if (model.get('accountId')) {
        accountId = model.get('accountId');
        accountName = model.get('accountName');
      }
      if (!accountId && model.get('parentType') === 'Account' && model.get('parentId')) {
        accountId = model.get('parentId');
        accountName = model.get('parentName');
      }
      if (accountId) {
        advanced.account = {
          attribute: 'accountId',
          type: 'equals',
          value: accountId,
          data: {
            type: 'is',
            nameValue: accountName
          }
        };
      }
      return Promise.resolve({
        advanced: advanced
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = SameAccountSelectRelatedHandler;
  _exports.default = _default;
});

define("handlers/select-related/same-account-many", ["exports", "handlers/select-related"], function (_exports, _selectRelated) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _selectRelated = _interopRequireDefault(_selectRelated);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class SameAccountManySelectRelatedHandler extends _selectRelated.default {
    /**
     * @param {module:model} model
     * @return {Promise<module:handlers/select-related~filters>}
     */
    getFilters(model) {
      const advanced = {};
      let accountId = null;
      let accountName = null;
      if (model.get('accountId')) {
        accountId = model.get('accountId');
        accountName = model.get('accountName');
      }
      if (!accountId && model.get('parentType') === 'Account' && model.get('parentId')) {
        accountId = model.get('parentId');
        accountName = model.get('parentName');
      }
      if (accountId) {
        const nameHash = {};
        nameHash[accountId] = accountName;
        advanced.accounts = {
          field: 'accounts',
          type: 'linkedWith',
          value: [accountId],
          data: {
            nameHash: nameHash
          }
        };
      }
      return Promise.resolve({
        advanced: advanced
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = SameAccountManySelectRelatedHandler;
  _exports.default = _default;
});

define("handlers/map/google-maps-renderer", ["exports", "handlers/map/renderer"], function (_exports, _renderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _renderer = _interopRequireDefault(_renderer);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class GoogleMapsRenderer extends _renderer.default {
    /**
     * @param {module:handlers/map/renderer~addressData} addressData
     */
    render(addressData) {
      if ('google' in window && window.google.maps) {
        this.initMapGoogle(addressData);
        return;
      }

      // noinspection SpellCheckingInspection
      if (typeof window.mapapiloaded === 'function') {
        // noinspection SpellCheckingInspection
        const mapapiloaded = window.mapapiloaded;

        // noinspection SpellCheckingInspection
        window.mapapiloaded = () => {
          this.initMapGoogle(addressData);
          mapapiloaded();
        };
        return;
      }

      // noinspection SpellCheckingInspection
      window.mapapiloaded = () => this.initMapGoogle(addressData);
      let src = 'https://maps.googleapis.com/maps/api/js?callback=mapapiloaded';
      const apiKey = this.view.getConfig().get('googleMapsApiKey');
      if (apiKey) {
        src += '&key=' + apiKey;
      }
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('async', 'async');
      scriptElement.src = src;
      document.head.appendChild(scriptElement);
    }

    /**
     * @param {module:handlers/map/renderer~addressData} addressData
     */
    initMapGoogle(addressData) {
      // noinspection JSUnresolvedReference
      const geocoder = new google.maps.Geocoder();
      let map;
      try {
        // noinspection SpellCheckingInspection,JSUnresolvedReference
        map = new google.maps.Map(this.view.$el.find('.map').get(0), {
          zoom: 15,
          center: {
            lat: 0,
            lng: 0
          },
          scrollwheel: false
        });
      } catch (e) {
        console.error(e.message);
        return;
      }
      let address = '';
      if (addressData.street) {
        address += addressData.street;
      }
      if (addressData.city) {
        if (address !== '') {
          address += ', ';
        }
        address += addressData.city;
      }
      if (addressData.state) {
        if (address !== '') {
          address += ', ';
        }
        address += addressData.state;
      }
      if (addressData.postalCode) {
        if (addressData.state || addressData.city) {
          address += ' ';
        } else {
          if (address) {
            address += ', ';
          }
        }
        address += addressData.postalCode;
      }
      if (addressData.country) {
        if (address !== '') {
          address += ', ';
        }
        address += addressData.country;
      }

      // noinspection JSUnresolvedReference
      geocoder.geocode({
        'address': address
      }, (results, status) => {
        // noinspection JSUnresolvedReference
        if (status === google.maps.GeocoderStatus.OK) {
          // noinspection JSUnresolvedReference
          map.setCenter(results[0].geometry.location);

          // noinspection JSUnresolvedReference
          new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
          });
        }
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = GoogleMapsRenderer;
  _exports.default = _default;
});

define("handlers/login/oidc", ["exports", "handlers/login", "js-base64"], function (_exports, _login, _jsBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _login = _interopRequireDefault(_login);
  _jsBase = _interopRequireDefault(_jsBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class OidcLoginHandler extends _login.default {
    /** @inheritDoc */
    process() {
      Espo.Ui.notify(' ... ');
      return new Promise((resolve, reject) => {
        Espo.Ajax.getRequest('Oidc/authorizationData').then(data => {
          Espo.Ui.notify(false);
          this.processWithData(data).then(info => {
            const code = info.code;
            const nonce = info.nonce;
            const authString = _jsBase.default.encode('**oidc:' + code);
            const headers = {
              'Espo-Authorization': authString,
              'Authorization': 'Basic ' + authString,
              'X-Oidc-Authorization-Nonce': nonce
            };
            resolve(headers);
          }).catch(() => {
            reject();
          });
        }).catch(() => {
          Espo.Ui.notify(false);
          reject();
        });
      });
    }

    /**
     * @private
     * @param {{
     *  endpoint: string,
     *  clientId: string,
     *  redirectUri: string,
     *  scopes: string[],
     *  claims: ?string,
     *  prompt: 'login'|'consent'|'select_account',
     *  maxAge: ?Number,
     * }} data
     * @return {Promise<{code: string, nonce: string}>}
     */
    processWithData(data) {
      const state = (Math.random() + 1).toString(36).substring(7);
      const nonce = (Math.random() + 1).toString(36).substring(7);
      const params = {
        client_id: data.clientId,
        redirect_uri: data.redirectUri,
        response_type: 'code',
        scope: data.scopes.join(' '),
        state: state,
        nonce: nonce,
        prompt: data.prompt
      };
      if (data.maxAge || data.maxAge === 0) {
        params.max_age = data.maxAge;
      }
      if (data.claims) {
        params.claims = data.claims;
      }
      const partList = Object.entries(params).map(([key, value]) => {
        return key + '=' + encodeURIComponent(value);
      });
      const url = data.endpoint + '?' + partList.join('&');
      return this.processWindow(url, state, nonce);
    }

    /**
     * @private
     * @param {string} url
     * @param {string} state
     * @param {string} nonce
     * @return {Promise<{code: string, nonce: string}>}
     */
    processWindow(url, state, nonce) {
      const proxy = window.open(url, 'ConnectWithOAuth', 'location=0,status=0,width=800,height=800');
      return new Promise((resolve, reject) => {
        const fail = () => {
          window.clearInterval(interval);
          if (!proxy.closed) {
            proxy.close();
          }
          reject();
        };
        const interval = window.setInterval(() => {
          if (proxy.closed) {
            fail();
            return;
          }
          let url;
          try {
            url = proxy.location.href;
          } catch (e) {
            return;
          }
          if (!url) {
            return;
          }
          const parsedData = this.parseWindowUrl(url);
          if (!parsedData) {
            fail();
            Espo.Ui.error('Could not parse URL', true);
            return;
          }
          if ((parsedData.error || parsedData.code) && parsedData.state !== state) {
            fail();
            Espo.Ui.error('State mismatch', true);
            return;
          }
          if (parsedData.error) {
            fail();
            Espo.Ui.error(parsedData.errorDescription || this.loginView.translate('Error'), true);
            return;
          }
          if (parsedData.code) {
            window.clearInterval(interval);
            proxy.close();
            resolve({
              code: parsedData.code,
              nonce: nonce
            });
          }
        }, 300);
      });
    }

    /**
     * @param {string} url
     * @return {?{
     *     code: ?string,
     *     state: ?string,
     *     error: ?string,
     *     errorDescription: ?string,
     * }}
     */
    parseWindowUrl(url) {
      try {
        const params = new URL(url).searchParams;
        return {
          code: params.get('code'),
          state: params.get('state'),
          error: params.get('error'),
          errorDescription: params.get('errorDescription')
        };
      } catch (e) {
        return null;
      }
    }
  }
  var _default = OidcLoginHandler;
  _exports.default = _default;
});

define("acl-portal/preferences", ["exports", "acl-portal"], function (_exports, _aclPortal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _aclPortal = _interopRequireDefault(_aclPortal);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class PreferencesAclPortal extends _aclPortal.default {
    checkIsOwner(model) {
      if (this.getUser().id === model.id) {
        return true;
      }
      return false;
    }
  }
  var _default = PreferencesAclPortal;
  _exports.default = _default;
});

define("acl-portal/notification", ["exports", "acl-portal"], function (_exports, _aclPortal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _aclPortal = _interopRequireDefault(_aclPortal);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class NotificationAclPortal extends _aclPortal.default {
    checkIsOwner(model) {
      if (this.getUser().id === model.get('userId')) {
        return true;
      }
      return false;
    }
  }
  var _default = NotificationAclPortal;
  _exports.default = _default;
});

define("acl-portal/email", ["exports", "acl-portal"], function (_exports, _aclPortal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _aclPortal = _interopRequireDefault(_aclPortal);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  class EmailAclPortal extends _aclPortal.default {
    // noinspection JSUnusedGlobalSymbols
    checkModelRead(model, data, precise) {
      const result = this.checkModel(model, data, 'read', precise);
      if (result) {
        return true;
      }
      if (data === false) {
        return false;
      }
      const d = data || {};
      if (d.read === 'no') {
        return false;
      }
      if (model.has('usersIds')) {
        if (~(model.get('usersIds') || []).indexOf(this.getUser().id)) {
          return true;
        }
      } else if (precise) {
        return null;
      }
      return result;
    }
  }
  var _default = EmailAclPortal;
  _exports.default = _default;
});

