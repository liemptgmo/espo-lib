define("views/fields/assigned-user", ["exports", "views/fields/user-with-avatar"], function (_exports, _userWithAvatar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _userWithAvatar = _interopRequireDefault(_userWithAvatar);
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

  class AssignedUserFieldView extends _userWithAvatar.default {
    init() {
      this.assignmentPermission = this.getAcl().getPermissionLevel('assignmentPermission');
      if (this.assignmentPermission === 'no') {
        this.setReadOnly(true);
      }
      super.init();
    }
    getSelectBoolFilterList() {
      if (this.assignmentPermission === 'team') {
        return ['onlyMyTeam'];
      }
    }
    getSelectPrimaryFilterName() {
      return 'active';
    }
    getEmptyAutocompleteResult() {
      return {
        list: [{
          id: this.getUser().id,
          name: this.getUser().get('name')
        }]
      };
    }
  }
  var _default = AssignedUserFieldView;
  _exports.default = _default;
});
//# sourceMappingURL=assigned-user.js.map ;