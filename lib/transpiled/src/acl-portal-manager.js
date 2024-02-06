define("acl-portal-manager", ["exports", "acl-manager", "acl-portal"], function (_exports, _aclManager, _aclPortal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _aclManager = _interopRequireDefault(_aclManager);
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

  /** @module acl-portal-manager */

  /**
   * An access checking class for a specific scope for portals.
   */
  class AclPortalManager extends _aclManager.default {
    // noinspection JSUnusedGlobalSymbols
    /**
     * Check if a user in an account of a model.
     *
     * @param {module:model} model A model.
     * @returns {boolean|null} True if in an account, null if not clear.
     */
    checkInAccount(model) {
      const impl = /** @type {module:acl-portal} */
      this.getImplementation(model.entityType);
      return impl.checkInAccount(model);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Check if a user is a contact-owner to a model.
     *
     * @param {module:model} model A model.
     * @returns {boolean|null} True if in a contact-owner, null if not clear.
     */
    checkIsOwnContact(model) {
      const impl = /** @type {module:acl-portal} */
      this.getImplementation(model.entityType);
      return impl.checkIsOwnContact(model);
    }

    /**
     * @param {string} scope A scope.
     * @returns {module:acl-portal}
     */
    getImplementation(scope) {
      if (!(scope in this.implementationHash)) {
        let implementationClass = _aclPortal.default;
        if (scope in this.implementationClassMap) {
          implementationClass = this.implementationClassMap[scope];
        }
        this.implementationHash[scope] = new implementationClass(this.getUser(), scope, this.aclAllowDeleteCreated);
      }
      return this.implementationHash[scope];
    }
  }
  var _default = AclPortalManager;
  _exports.default = _default;
});
//# sourceMappingURL=acl-portal-manager.js.map ;