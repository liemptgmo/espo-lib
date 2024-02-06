define("modules/crm/views/knowledge-base-article/record/detail", ["exports", "modules/crm/knowledge-base-helper", "views/record/detail"], function (_exports, _knowledgeBaseHelper, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _knowledgeBaseHelper = _interopRequireDefault(_knowledgeBaseHelper);
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
  /**
   * @class
   * @name Class
   * @extends Dep
   */
  var _default = _detail.default.extend( /** @lends Class# */{
    saveAndContinueEditingAction: true,
    setup: function () {
      _detail.default.prototype.setup.call(this);
      if (this.getUser().isPortal()) {
        this.sideDisabled = true;
      }
      if (this.getAcl().checkScope('Email', 'create')) {
        this.dropdownItemList.push({
          'label': 'Send in Email',
          'name': 'sendInEmail'
        });
      }
      if (this.getUser().isPortal()) {
        if (!this.getAcl().checkScope(this.scope, 'edit')) {
          if (!this.model.getLinkMultipleIdList('attachments').length) {
            this.hideField('attachments');
            this.listenToOnce(this.model, 'sync', () => {
              if (this.model.getLinkMultipleIdList('attachments').length) {
                this.showField('attachments');
              }
            });
          }
        }
      }
    },
    actionSendInEmail: function () {
      Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
      let helper = new _knowledgeBaseHelper.default(this.getLanguage());
      helper.getAttributesForEmail(this.model, {}, attributes => {
        let viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
        this.createView('composeEmail', viewName, {
          attributes: attributes,
          selectTemplateDisabled: true,
          signatureDisabled: true
        }, view => {
          Espo.Ui.notify(false);
          view.render();
        });
      });
    },
    afterRender: function () {
      _detail.default.prototype.afterRender.call(this);
      if (this.getUser().isPortal()) {
        this.$el.find('.field[data-name="body"]').css('minHeight', '400px');
      }
    }
  });
  _exports.default = _default;
});
//# sourceMappingURL=detail.js.map ;