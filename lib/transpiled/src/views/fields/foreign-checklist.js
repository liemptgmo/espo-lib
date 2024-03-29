define("views/fields/foreign-checklist", ["exports", "views/fields/checklist"], function (_exports, _checklist) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _checklist = _interopRequireDefault(_checklist);
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

  class ForeignChecklistFieldView extends _checklist.default {
    type = 'foreign';
    setupOptions() {
      this.params.options = [];
      if (!this.params.field || !this.params.link) {
        return;
      }
      const scope = this.getMetadata().get(['entityDefs', this.model.entityType, 'links', this.params.link, 'entity']);
      if (!scope) {
        return;
      }
      this.params.isSorted = this.getMetadata().get(['entityDefs', scope, 'fields', this.params.field, 'isSorted']) || false;
      this.params.options = this.getMetadata().get(['entityDefs', scope, 'fields', this.params.field, 'options']) || [];
      this.translatedOptions = {};
      this.params.options.forEach(item => {
        this.translatedOptions[item] = this.getLanguage().translateOption(item, this.params.field, scope);
      });
    }
  }
  var _default = ForeignChecklistFieldView;
  _exports.default = _default;
});
//# sourceMappingURL=foreign-checklist.js.map ;