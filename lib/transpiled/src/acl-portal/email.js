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
//# sourceMappingURL=email.js.map ;