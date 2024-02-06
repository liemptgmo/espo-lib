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
//# sourceMappingURL=container.js.map ;