define("collections/note", ["exports", "collection"], function (_exports, _collection) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _collection = _interopRequireDefault(_collection);
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

  /** @module collections/note */

  class NoteCollection extends _collection.default {
    /** @inheritDoc */
    prepareAttributes(response, params) {
      const total = this.total;
      const list = super.prepareAttributes(response, params);
      if (params.data && params.data.after) {
        if (total >= 0 && response.total >= 0) {
          this.total = total + response.total;
        } else {
          this.total = total;
        }
      }
      return list;
    }

    /**
     * Fetch new records.
     *
     * @param {Object} [options] Options.
     * @returns {Promise}
     */
    fetchNew(options) {
      options = options || {};
      options.data = options.data || {};
      options.fetchNew = true;
      options.noRebuild = true;
      options.lengthBeforeFetch = this.length;
      if (this.length) {
        options.data.after = this.models[0].get('createdAt');
        options.remove = false;
        options.at = 0;
        options.maxSize = null;
      }
      return this.fetch(options);
    }
  }
  var _default = NoteCollection;
  _exports.default = _default;
});
//# sourceMappingURL=note.js.map ;