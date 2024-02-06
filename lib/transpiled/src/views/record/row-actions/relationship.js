define("views/record/row-actions/relationship", ["exports", "views/record/row-actions/default"], function (_exports, _default2) {
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

  class RelationshipActionsView extends _default2.default {
    getActionList() {
      const list = [{
        action: 'quickView',
        label: 'View',
        data: {
          id: this.model.id
        },
        link: '#' + this.model.entityType + '/view/' + this.model.id
      }];
      if (this.options.acl.edit && !this.options.editDisabled) {
        list.push({
          action: 'quickEdit',
          label: 'Edit',
          data: {
            id: this.model.id
          },
          link: '#' + this.model.entityType + '/edit/' + this.model.id
        });
      }
      if (!this.options.unlinkDisabled) {
        list.push({
          action: 'unlinkRelated',
          label: 'Unlink',
          data: {
            id: this.model.id
          }
        });
      }
      this.getAdditionalActionList().forEach(item => list.push(item));
      if (this.options.acl.delete && !this.options.removeDisabled) {
        list.push({
          action: 'removeRelated',
          label: 'Remove',
          data: {
            id: this.model.id
          }
        });
      }
      return list;
    }
  }
  var _default = RelationshipActionsView;
  _exports.default = _default;
});
//# sourceMappingURL=relationship.js.map ;