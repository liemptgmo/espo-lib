define("views/stream/message", ["exports", "view"], function (_exports, _view) {
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

  class MessageStreamView extends _view.default {
    data() {
      return this.dataForTemplate;
    }
    setup() {
      let template = this.options.messageTemplate;
      let data = Espo.Utils.clone(this.options.messageData || {});
      this.dataForTemplate = {};
      for (let key in data) {
        let value = data[key] || '';
        if (key.indexOf('html:') === 0) {
          key = key.substring(5);
          this.dataForTemplate[key] = value;
          template = template.replace('{' + key + '}', '{{{' + key + '}}}');
          continue;
        }
        if (value instanceof jQuery) {
          this.dataForTemplate[key] = value.get(0).outerHTML;
          template = template.replace('{' + key + '}', '{{{' + key + '}}}');
          continue;
        }
        if (value instanceof Element) {
          this.dataForTemplate[key] = value.outerHTML;
          template = template.replace('{' + key + '}', '{{{' + key + '}}}');
          continue;
        }
        if (!value.indexOf) {
          continue;
        }
        if (value.indexOf('field:') === 0) {
          let field = value.substring(6);
          this.createField(key, field);
          let keyEscaped = this.getHelper().escapeString(key);
          template = template.replace('{' + key + '}', `<span data-key="${keyEscaped}">\{\{\{${key}\}\}\}</span>`);
          continue;
        }
        this.dataForTemplate[key] = value;
        template = template.replace('{' + key + '}', '{{' + key + '}}');
      }
      this.templateContent = template;
    }
    createField(key, name, type, params) {
      type = type || this.model.getFieldType(name) || 'base';
      this.createView(key, this.getFieldManager().getViewName(type), {
        model: this.model,
        defs: {
          name: name,
          params: params || {}
        },
        mode: 'detail',
        readOnly: true,
        selector: `[data-key="${key}"]`
      });
    }
  }
  var _default = MessageStreamView;
  _exports.default = _default;
});
//# sourceMappingURL=message.js.map ;