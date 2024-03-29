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
//# sourceMappingURL=same-account-many.js.map ;