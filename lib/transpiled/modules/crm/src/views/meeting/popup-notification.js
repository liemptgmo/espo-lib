define("modules/crm/views/meeting/popup-notification", ["exports", "views/popup-notification"], function (_exports, _popupNotification) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _popupNotification = _interopRequireDefault(_popupNotification);
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

  class MeetingPopupNotificationView extends _popupNotification.default {
    template = 'crm:meeting/popup-notification';
    type = 'event';
    style = 'primary';
    closeButton = true;
    setup() {
      if (!this.notificationData.entityType) {
        return;
      }
      let promise = this.getModelFactory().create(this.notificationData.entityType, model => {
        let dateAttribute = 'dateStart';
        if (this.notificationData.entityType === 'Task') {
          dateAttribute = 'dateEnd';
        }
        this.dateAttribute = dateAttribute;
        model.set(dateAttribute, this.notificationData[dateAttribute]);
        this.createView('dateField', 'views/fields/datetime', {
          model: model,
          mode: 'detail',
          selector: '.field[data-name="' + dateAttribute + '"]',
          defs: {
            name: dateAttribute
          },
          readOnly: true
        });
      });
      this.wait(promise);
    }
    data() {
      return {
        header: this.translate(this.notificationData.entityType, 'scopeNames'),
        dateAttribute: this.dateAttribute,
        ...super.data()
      };
    }
    onCancel() {
      Espo.Ajax.postRequest('Activities/action/removePopupNotification', {
        id: this.notificationId
      });
    }
  }
  var _default = MeetingPopupNotificationView;
  _exports.default = _default;
});
//# sourceMappingURL=popup-notification.js.map ;