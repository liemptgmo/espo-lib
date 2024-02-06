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

define('crm:views/meeting/fields/attendees', ['views/fields/link-multiple-with-role'], function (Dep) {

    return Dep.extend({

        columnName: 'status',

        roleFieldIsForeign: false,

        emptyRoleValue: 'None',
    });
});

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

define('crm:views/meeting/fields/contacts', ['crm:views/meeting/fields/attendees'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

define("modules/crm/knowledge-base-helper", ["exports", "ajax"], function (_exports, _ajax) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ajax = _interopRequireDefault(_ajax);
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

  /**
   * @todo Move to modules/crm/helpers.
   */
  class KnowledgeBaseHelper {
    /**
     * @param {module:language} language
     */
    constructor(language) {
      this.language = language;
    }
    getAttributesForEmail(model, attributes, callback) {
      attributes = attributes || {};
      attributes.body = model.get('body');
      if (attributes.name) {
        attributes.name = attributes.name + ' ';
      } else {
        attributes.name = '';
      }
      attributes.name += this.language.translate('KnowledgeBaseArticle', 'scopeNames') + ': ' + model.get('name');
      _ajax.default.postRequest('KnowledgeBaseArticle/action/getCopiedAttachments', {
        id: model.id,
        parentType: 'Email',
        field: 'attachments'
      }).then(data => {
        attributes.attachmentsIds = data.ids;
        attributes.attachmentsNames = data.names;
        attributes.isHtml = true;
        callback(attributes);
      });
    }
  }
  var _default = KnowledgeBaseHelper;
  _exports.default = _default;
});

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

define('crm:views/task/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'crm:views/task/record/row-actions/default',

        actionSetCompleted: function (data) {
            var id = data.id;

            if (!id) {
                return;
            }

            var model = this.collection.get(id);

            if (!model) {
                return;
            }

            model.set('status', 'Completed');

            this.listenToOnce(model, 'sync', () => {
                Espo.Ui.notify(false);
                this.collection.fetch();
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));
            model.save();
        },
    });
});

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

define('crm:views/record/panels/tasks', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        name: 'tasks',

        entityType: 'Task',

        filterList: ['all', 'actual', 'completed'],

        defaultTab: 'actual',

        orderBy: 'createdAt',

        orderDirection: 'desc',

        rowActionsView: 'crm:views/record/row-actions/tasks',

        buttonList: [
            {
                action: 'createTask',
                title: 'Create Task',
                acl: 'create',
                aclScope: 'Task',
                html: '<span class="fas fa-plus"></span>',
            },
        ],

        actionList: [
            {
                label: 'View List',
                action: 'viewRelatedList'
            }
        ],

        listLayout: {
            rows: [
                [
                    {
                        name: 'name',
                        link: true,
                    },
                ],
                [
                    {
                        name: 'isOverdue'
                    },
                    {name: 'assignedUser'},
                    {name: 'dateEnd'},
                    {name: 'status'},
                ]
            ]
        },

        setup: function () {
            this.parentScope = this.model.entityType;
            this.link = 'tasks';

            this.panelName = 'tasksSide';

            this.defs.create = true;

            if (this.parentScope === 'Account') {
                this.link = 'tasksPrimary';
            }

            this.url = this.model.entityType + '/' + this.model.id + '/' + this.link;

            this.setupSorting();

            if (this.filterList && this.filterList.length) {
                this.filter = this.getStoredFilter();
            }

            this.setupFilterActions();

            this.setupTitle();

            this.wait(true);

            this.getCollectionFactory().create('Task', (collection) => {
                this.collection = collection;
                collection.seeds = this.seeds;
                collection.url = this.url;
                collection.orderBy = this.defaultOrderBy;
                collection.order = this.defaultOrder;
                collection.maxSize = this.getConfig().get('recordsPerPageSmall') || 5;

                this.setFilter(this.filter);
                this.wait(false);
            });

            this.once('show', () => {
                if (!this.isRendered() && !this.isBeingRendered()) {
                    this.collection.fetch();
                }
            });
        },

        afterRender: function () {
            this.createView('list', 'views/record/list-expanded', {
                selector: '> .list-container',
                pagination: false,
                type: 'listRelationship',
                rowActionsView: this.defs.rowActionsView || this.rowActionsView,
                checkboxes: false,
                collection: this.collection,
                listLayout: this.listLayout,
                skipBuildRows: true,
            }, (view) => {
                view.getSelectAttributeList(selectAttributeList => {
                    if (selectAttributeList) {
                        this.collection.data.select = selectAttributeList.join(',');
                    }

                    if (!this.disabled) {
                        this.collection.fetch();

                        return;
                    }

                    this.once('show', () => this.collection.fetch());
                });
            });
        },

        actionCreateRelated: function () {
            this.actionCreateTask();
        },

        actionCreateTask: function (data) {
            let link = this.link;

            if (this.parentScope === 'Account') {
                link = 'tasks';
            }

            let scope = 'Task';
            let foreignLink = this.model.defs['links'][link].foreign;

            Espo.Ui.notify(' ... ');

            let viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.edit') ||
                'views/modals/edit';

            this.createView('quickCreate', viewName, {
                scope: scope,
                relate: {
                    model: this.model,
                    link: foreignLink,
                }
            }, (view) => {
                view.render();
                view.notify(false);

                this.listenToOnce(view, 'after:save', () => {
                    this.collection.fetch();
                    this.model.trigger('after:relate');
                });
            });
        },

        actionRefresh: function () {
            this.collection.fetch();
        },

        actionComplete: function (data) {
            let id = data.id;

            if (!id) {
                return;
            }

            let model = this.collection.get(id);

            model.save({status: 'Completed'}, {patch: true})
                .then(() => this.collection.fetch());
        },

        actionViewRelatedList: function (data) {
            data.viewOptions = data.viewOptions || {};
            data.viewOptions.massUnlinkDisabled = true;

            Dep.prototype.actionViewRelatedList.call(this, data);
        },
    });
});

define("modules/crm/views/record/panels/activities", ["exports", "views/record/panels/relationship", "multi-collection"], function (_exports, _relationship, _multiCollection) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _relationship = _interopRequireDefault(_relationship);
  _multiCollection = _interopRequireDefault(_multiCollection);
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

  class ActivitiesPanelView extends _relationship.default {
    name = 'activities';
    orderBy = 'dateStart';
    serviceName = 'Activities';
    order = 'desc';
    rowActionsView = 'crm:views/record/row-actions/activities';
    relatedListFiltersDisabled = true;
    buttonMaxCount = null;
    actionList = [{
      action: 'composeEmail',
      label: 'Compose Email',
      acl: 'create',
      aclScope: 'Email'
    }];
    listLayout = {};
    defaultListLayout = {
      rows: [[{
        name: 'ico',
        view: 'crm:views/fields/ico'
      }, {
        name: 'name',
        link: true,
        view: 'views/event/fields/name-for-history'
      }], [{
        name: 'assignedUser'
      }, {
        name: 'dateStart'
      }]]
    };
    BUTTON_MAX_COUNT = 3;
    setup() {
      this.scopeList = this.getConfig().get(this.name + 'EntityList') || [];
      this.buttonMaxCount = this.getConfig().get('activitiesCreateButtonMaxCount');
      if (typeof this.buttonMaxCount === 'undefined') {
        this.buttonMaxCount = this.BUTTON_MAX_COUNT;
      }
      this.listLayout = Espo.Utils.cloneDeep(this.listLayout);
      this.defs.create = true;
      this.createAvailabilityHash = {};
      this.entityTypeLinkMap = {};
      this.createEntityTypeStatusMap = {};
      this.setupActionList();
      this.setupFinalActionList();
      this.setupSorting();
      this.scopeList.forEach(item => {
        if (!(item in this.listLayout)) {
          this.listLayout[item] = this.defaultListLayout;
        }
      });
      this.url = this.serviceName + '/' + this.model.entityType + '/' + this.model.id + '/' + this.name;
      this.seeds = {};
      this.wait(true);
      let i = 0;
      this.scopeList.forEach(scope => {
        this.getModelFactory().create(scope, seed => {
          this.seeds[scope] = seed;
          i++;
          if (i === this.scopeList.length) {
            this.wait(false);
          }
        });
      });
      if (this.scopeList.length === 0) {
        this.wait(false);
      }
      this.filterList = [];
      this.scopeList.forEach(item => {
        if (!this.getAcl().check(item)) {
          return;
        }
        if (!this.getAcl().check(item, 'read')) {
          return;
        }
        if (this.getMetadata().get(['scopes', item, 'disabled'])) {
          return;
        }
        this.filterList.push(item);
      });
      if (this.filterList.length) {
        this.filterList.unshift('all');
      }
      if (this.filterList && this.filterList.length) {
        this.filter = this.getStoredFilter();
      }
      this.setupFilterActions();
      this.setupTitle();
      this.collection = new _multiCollection.default();
      this.collection.seeds = this.seeds;
      this.collection.url = this.url;
      this.collection.orderBy = this.orderBy;
      this.collection.order = this.order;
      this.collection.maxSize = this.getConfig().get('recordsPerPageSmall') || 5;
      this.setFilter(this.filter);
      this.once('show', () => {
        if (!this.isRendered() && !this.isBeingRendered()) {
          this.collection.fetch();
        }
      });
    }
    translateFilter(name) {
      if (name === 'all') {
        return this.translate(name, 'presetFilters');
      }
      return this.translate(name, 'scopeNamesPlural');
    }
    isCreateAvailable(scope) {
      return this.createAvailabilityHash[scope];
    }
    setupActionList() {
      if (this.name === 'activities' && this.buttonMaxCount) {
        this.buttonList.push({
          action: 'composeEmail',
          title: 'Compose Email',
          acl: 'create',
          aclScope: 'Email',
          html: $('<span>').addClass(this.getMetadata().get(['clientDefs', 'Email', 'iconClass'])).get(0).outerHTML
        });
      }
      this.scopeList.forEach(scope => {
        if (!this.getMetadata().get(['clientDefs', scope, 'activityDefs', this.name + 'Create'])) {
          return;
        }
        if (!this.getAcl().checkScope(scope, 'create')) {
          return;
        }
        let label = (this.name === 'history' ? 'Log' : 'Schedule') + ' ' + scope;
        let o = {
          action: 'createActivity',
          text: this.translate(label, 'labels', scope),
          data: {},
          acl: 'create',
          aclScope: scope
        };
        let link = this.getMetadata().get(['clientDefs', scope, 'activityDefs', 'link']);
        if (link) {
          o.data.link = link;
          this.entityTypeLinkMap[scope] = link;
          if (!this.model.hasLink(link)) {
            return;
          }
        } else {
          o.data.scope = scope;
          if (this.model.entityType !== 'User' && !this.checkParentTypeAvailability(scope, this.model.entityType)) {
            return;
          }
        }
        this.createAvailabilityHash[scope] = true;
        o.data = o.data || {};
        if (!o.data.status) {
          let statusList = this.getMetadata().get(['scopes', scope, this.name + 'StatusList']);
          if (statusList && statusList.length) {
            o.data.status = statusList[0];
          }
        }
        this.createEntityTypeStatusMap[scope] = o.data.status;
        this.actionList.push(o);
        if (this.name === 'activities' && this.buttonList.length < this.buttonMaxCount) {
          let ob = Espo.Utils.cloneDeep(o);
          let iconClass = this.getMetadata().get(['clientDefs', scope, 'iconClass']);
          if (iconClass) {
            ob.title = label;
            ob.html = $('<span>').addClass(iconClass).get(0).outerHTML;
            this.buttonList.push(ob);
          }
        }
      });
    }
    setupFinalActionList() {
      this.scopeList.forEach((scope, i) => {
        if (i === 0 && this.actionList.length) {
          this.actionList.push(false);
        }
        if (!this.getAcl().checkScope(scope, 'read')) {
          return;
        }
        let o = {
          action: 'viewRelatedList',
          html: $('<span>').append($('<span>').text(this.translate('View List')), ' &middot; ', $('<span>').text(this.translate(scope, 'scopeNamesPlural'))).get(0).innerHTML,
          data: {
            scope: scope
          },
          acl: 'read',
          aclScope: scope
        };
        this.actionList.push(o);
      });
    }
    setFilter(filter) {
      this.filter = filter;
      this.collection.data.entityType = null;
      if (filter && filter !== 'all') {
        this.collection.data.entityType = this.filter;
      }
    }
    afterRender() {
      let afterFetch = () => {
        this.createView('list', 'views/record/list-expanded', {
          selector: '> .list-container',
          pagination: false,
          type: 'listRelationship',
          rowActionsView: this.rowActionsView,
          checkboxes: false,
          collection: this.collection,
          listLayout: this.listLayout
        }, view => {
          view.render();
          this.listenTo(view, 'after:save', () => {
            this.fetchActivities();
            this.fetchHistory();
          });
        });
      };
      if (!this.disabled) {
        this.collection.fetch().then(() => afterFetch());
      } else {
        this.once('show', () => {
          this.collection.fetch().then(() => afterFetch());
        });
      }
    }
    fetchHistory() {
      let parentView = this.getParentView();
      if (parentView) {
        if (parentView.hasView('history')) {
          let collection = parentView.getView('history').collection;
          if (collection) {
            collection.fetch();
          }
        }
      }
    }
    fetchActivities() {
      let parentView = this.getParentView();
      if (parentView) {
        if (parentView.hasView('activities')) {
          let collection = parentView.getView('activities').collection;
          if (collection) {
            collection.fetch();
          }
        }
      }
    }
    getCreateActivityAttributes(scope, data, callback) {
      data = data || {};
      let attributes = {
        status: data.status
      };
      if (this.model.entityType === 'User') {
        let model = /** @type {module:models/user} */this.model;
        if (model.isPortal()) {
          attributes.usersIds = [model.id];
          let usersIdsNames = {};
          usersIdsNames[model.id] = model.get('name');
          attributes.usersIdsNames = usersIdsNames;
        } else {
          attributes.assignedUserId = model.id;
          attributes.assignedUserName = model.get('name');
        }
      } else {
        if (this.model.entityType === 'Contact') {
          if (this.model.get('accountId') && !this.getConfig().get('b2cMode')) {
            attributes.parentType = 'Account';
            attributes.parentId = this.model.get('accountId');
            attributes.parentName = this.model.get('accountName');
            if (scope && !this.getMetadata().get(['entityDefs', scope, 'links', 'contacts']) && !this.getMetadata().get(['entityDefs', scope, 'links', 'contact'])) {
              delete attributes.parentType;
              delete attributes.parentId;
              delete attributes.parentName;
            }
          }
        } else if (this.model.entityType === 'Lead') {
          attributes.parentType = 'Lead';
          attributes.parentId = this.model.id;
          attributes.parentName = this.model.get('name');
        }
        if (this.model.entityType !== 'Account' && this.model.has('contactsIds')) {
          attributes.contactsIds = this.model.get('contactsIds');
          attributes.contactsNames = this.model.get('contactsNames');
        }
        if (scope) {
          if (!attributes.parentId) {
            if (this.checkParentTypeAvailability(scope, this.model.entityType)) {
              attributes.parentType = this.model.entityType;
              attributes.parentId = this.model.id;
              attributes.parentName = this.model.get('name');
            }
          } else {
            if (attributes.parentType && !this.checkParentTypeAvailability(scope, attributes.parentType)) {
              attributes.parentType = null;
              attributes.parentId = null;
              attributes.parentName = null;
            }
          }
        }
      }
      callback.call(this, Espo.Utils.cloneDeep(attributes));
    }
    checkParentTypeAvailability(scope, parentType) {
      return ~(this.getMetadata().get(['entityDefs', scope, 'fields', 'parent', 'entityList']) || []).indexOf(parentType);
    }

    // noinspection JSUnusedGlobalSymbols
    actionCreateRelated(data) {
      data.link = this.entityTypeLinkMap[data.scope];
      if (this.createEntityTypeStatusMap[data.scope]) {
        data.status = this.createEntityTypeStatusMap[data.scope];
      }
      this.actionCreateActivity(data);
    }
    actionCreateActivity(data) {
      let link = data.link;
      let foreignLink;
      let scope;
      if (link) {
        scope = this.model.getLinkParam(link, 'entity');
        foreignLink = this.model.getLinkParam(link, 'foreign');
      } else {
        scope = data.scope;
      }
      let o = {
        scope: scope
      };
      if (link) {
        o.relate = {
          model: this.model,
          link: foreignLink
        };
      }
      Espo.Ui.notify(' ... ');
      let viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.edit') || 'views/modals/edit';
      this.getCreateActivityAttributes(scope, data, attributes => {
        o.attributes = attributes;
        this.createView('quickCreate', viewName, o, view => {
          view.render();
          view.notify(false);
          this.listenToOnce(view, 'after:save', () => {
            this.model.trigger('after:relate');
            this.collection.fetch();
            this.fetchHistory();
          });
        });
      });
    }
    getComposeEmailAttributes(scope, data, callback) {
      let attributes = {
        status: 'Draft',
        to: this.model.get('emailAddress')
      };
      if (this.model.entityType === 'Contact') {
        if (this.getConfig().get('b2cMode')) {
          attributes.parentType = 'Contact';
          attributes.parentName = this.model.get('name');
          attributes.parentId = this.model.id;
        } else {
          if (this.model.get('accountId')) {
            attributes.parentType = 'Account';
            attributes.parentId = this.model.get('accountId');
            attributes.parentName = this.model.get('accountName');
          }
        }
      } else if (this.model.entityType === 'Lead') {
        attributes.parentType = 'Lead';
        attributes.parentId = this.model.id;
        attributes.parentName = this.model.get('name');
      }
      if (~['Contact', 'Lead', 'Account'].indexOf(this.model.entityType) && this.model.get('emailAddress')) {
        attributes.nameHash = {};
        attributes.nameHash[this.model.get('emailAddress')] = this.model.get('name');
      }
      if (scope) {
        if (!attributes.parentId) {
          if (this.checkParentTypeAvailability(scope, this.model.entityType)) {
            attributes.parentType = this.model.entityType;
            attributes.parentId = this.model.id;
            attributes.parentName = this.model.get('name');
          }
        } else {
          if (attributes.parentType && !this.checkParentTypeAvailability(scope, attributes.parentType)) {
            attributes.parentType = null;
            attributes.parentId = null;
            attributes.parentName = null;
          }
        }
      }
      let emailKeepParentTeamsEntityList = this.getConfig().get('emailKeepParentTeamsEntityList') || [];
      if (attributes.parentType && attributes.parentType === this.model.entityType && ~emailKeepParentTeamsEntityList.indexOf(attributes.parentType) && this.model.get('teamsIds') && this.model.get('teamsIds').length) {
        attributes.teamsIds = Espo.Utils.clone(this.model.get('teamsIds'));
        attributes.teamsNames = Espo.Utils.clone(this.model.get('teamsNames') || {});
        let defaultTeamId = this.getUser().get('defaultTeamId');
        if (defaultTeamId && !~attributes.teamsIds.indexOf(defaultTeamId)) {
          attributes.teamsIds.push(defaultTeamId);
          attributes.teamsNames[defaultTeamId] = this.getUser().get('defaultTeamName');
        }
        attributes.teamsIds = attributes.teamsIds.filter(teamId => {
          return this.getAcl().checkTeamAssignmentPermission(teamId);
        });
      }
      callback.call(this, attributes);
    }

    // noinspection JSUnusedGlobalSymbols
    actionComposeEmail(data) {
      let scope = 'Email';
      let relate = null;
      if ('emails' in this.model.defs['links']) {
        relate = {
          model: this.model,
          link: this.model.defs['links']['emails'].foreign
        };
      }
      Espo.Ui.notify(' ... ');
      this.getComposeEmailAttributes(scope, data, attributes => {
        this.createView('quickCreate', 'views/modals/compose-email', {
          relate: relate,
          attributes: attributes
        }, view => {
          view.render();
          view.notify(false);
          this.listenToOnce(view, 'after:save', () => {
            this.collection.fetch();
            this.model.trigger('after:relate');
            this.fetchHistory();
          });
        });
      });
    }
    actionRefresh() {
      this.collection.fetch();
    }
    actionSetHeld(data) {
      let id = data.id;
      if (!id) {
        return;
      }
      let model = this.collection.get(id);
      model.save({
        status: 'Held'
      }, {
        patch: true
      }).then(() => {
        this.collection.fetch();
        this.fetchHistory();
      });
    }
    actionSetNotHeld(data) {
      let id = data.id;
      if (!id) {
        return;
      }
      let model = this.collection.get(id);
      model.save({
        status: 'Not Held'
      }, {
        patch: true
      }).then(() => {
        this.collection.fetch();
        this.fetchHistory();
      });
    }
    actionViewRelatedList(data) {
      data.url = 'Activities/' + this.model.entityType + '/' + this.model.id + '/' + this.name + '/list/' + data.scope;
      data.title = this.translate(this.defs.label) + ' @right ' + this.translate(data.scope, 'scopeNamesPlural');
      data.viewOptions = data.viewOptions || {};
      data.viewOptions.massUnlinkDisabled = true;
      data.viewOptions.fullFormUrl = '#' + this.model.entityType + '/' + this.name + '/' + this.model.id + '/' + data.scope;
      super.actionViewRelatedList(data);
    }
  }
  var _default = ActivitiesPanelView;
  _exports.default = _default;
});

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

define('crm:views/opportunity/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        populateDefaults: function () {
            Dep.prototype.populateDefaults.call(this);

            var probabilityMap = this.getMetadata().get('entityDefs.Opportunity.fields.stage.probabilityMap') || {};

            var stage = this.model.get('stage');

            if (stage in probabilityMap) {
                this.model.set('probability', probabilityMap[stage], {silent: true});
            }
        },
    });
});

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

define('crm:views/meeting/detail', ['views/detail', 'lib!moment'], function (Dep, moment) {

    return Dep.extend({

        cancellationPeriod: '8 hours',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.controlSendInvitationsButton();
            this.controlAcceptanceStatusButton();
            this.controlSendCancellationButton();

            this.listenTo(this.model, 'sync', () => {
                this.controlSendInvitationsButton();
                this.controlSendCancellationButton();
            });

            this.listenTo(this.model, 'sync', () => {
                this.controlAcceptanceStatusButton();
            });

            this.setupCancellationPeriod();
        },

        setupCancellationPeriod: function () {
            this.cancellationPeriodAmount = 0;
            this.cancellationPeriodUnits = 'hours';

            let cancellationPeriod = this.getConfig().get('eventCancellationPeriod') || this.cancellationPeriod;

            if (!cancellationPeriod) {
                return;
            }

            let arr = cancellationPeriod.split(' ');

            this.cancellationPeriodAmount = parseInt(arr[0]);
            this.cancellationPeriodUnits = arr[1] ?? 'hours';
        },

        controlAcceptanceStatusButton: function () {
            if (!this.model.has('status')) {
                return;
            }

            if (!this.model.has('usersIds')) {
                return;
            }

            if (~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                this.removeMenuItem('setAcceptanceStatus');

                return;
            }

            if (!~this.model.getLinkMultipleIdList('users').indexOf(this.getUser().id)) {
                this.removeMenuItem('setAcceptanceStatus');

                return;
            }

            let acceptanceStatus = this.model.getLinkMultipleColumn('users', 'status', this.getUser().id);

            let text;
            let style = 'default';

            if (acceptanceStatus && acceptanceStatus !== 'None') {
                text = this.getLanguage().translateOption(acceptanceStatus, 'acceptanceStatus', this.model.entityType);

                style = this.getMetadata()
                    .get(['entityDefs', this.model.entityType, 'fields',
                        'acceptanceStatus', 'style', acceptanceStatus]);
            }
            else {
                text = this.translate('Acceptance', 'labels', 'Meeting');
            }

            this.removeMenuItem('setAcceptanceStatus', true);

            let iconHtml = '';

            if (style) {
                let iconClass = ({
                    'success': 'fas fa-check-circle',
                    'danger': 'fas fa-times-circle',
                    'warning': 'fas fa-question-circle',
                })[style];

                iconHtml = $('<span>')
                    .addClass(iconClass)
                    .addClass('text-' + style)
                    .get(0).outerHTML;
            }

            this.addMenuItem('buttons', {
                text: text,
                action: 'setAcceptanceStatus',
                iconHtml: iconHtml,
            });
        },

        controlSendInvitationsButton: function () {
            let show = true;

            if (['Held', 'Not Held'].includes(this.model.get('status'))) {
                show = false;
            }

            if (
                show &&
                !this.getAcl().checkModel(this.model, 'edit')
            ) {
                show = false;
            }

            if (show) {
                let userIdList = this.model.getLinkMultipleIdList('users');
                let contactIdList = this.model.getLinkMultipleIdList('contacts');
                let leadIdList = this.model.getLinkMultipleIdList('leads');

                if (!contactIdList.length && !leadIdList.length && !userIdList.length) {
                    show = false;
                }
                /*else if (
                    !contactIdList.length &&
                    !leadIdList.length &&
                    userIdList.length === 1 &&
                    userIdList[0] === this.getUser().id &&
                    this.model.getLinkMultipleColumn('users', 'status', this.getUser().id) === 'Accepted'
                ) {
                    show = false;
                }*/
            }

            if (show) {
                let dateEnd = this.model.get('dateEnd');

                if (
                    dateEnd &&
                    this.getDateTime().toMoment(dateEnd).isBefore(moment.now())
                ) {
                    show = false;
                }
            }

            if (show) {
                this.addMenuItem('buttons', {
                    text: this.translate('Send Invitations', 'labels', 'Meeting'),
                    action: 'sendInvitations',
                    acl: 'edit',
                });

                return;
            }

            this.removeMenuItem('sendInvitations');
        },

        controlSendCancellationButton: function () {
            let show = this.model.get('status') === 'Not Held';

            if (show) {
                let dateEnd = this.model.get('dateEnd');

                if (
                    dateEnd &&
                    this.getDateTime()
                        .toMoment(dateEnd)
                        .subtract(this.cancellationPeriodAmount, this.cancellationPeriodUnits)
                        .isBefore(moment.now())
                ) {
                    show = false;
                }
            }

            if (show) {
                let userIdList = this.model.getLinkMultipleIdList('users');
                let contactIdList = this.model.getLinkMultipleIdList('contacts');
                let leadIdList = this.model.getLinkMultipleIdList('leads');

                if (!contactIdList.length && !leadIdList.length && !userIdList.length) {
                    show = false;
                }
            }

            if (show) {
                this.addMenuItem('dropdown', {
                    text: this.translate('Send Cancellation', 'labels', 'Meeting'),
                    action: 'sendCancellation',
                    acl: 'edit',
                });

                return;
            }

            this.removeMenuItem('sendCancellation');
        },

        actionSendInvitations: function () {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'crm:views/meeting/modals/send-invitations', {
                model: this.model,
            }).then(view => {
                Espo.Ui.notify(false);

                view.render();

                this.listenToOnce(view, 'sent', () => this.model.fetch());
            });
        },

        actionSendCancellation: function () {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'crm:views/meeting/modals/send-cancellation', {
                model: this.model,
            }).then(view => {
                Espo.Ui.notify(false);

                view.render();

                this.listenToOnce(view, 'sent', () => this.model.fetch());
            });
        },

        actionSetAcceptanceStatus: function () {
            this.createView('dialog', 'crm:views/meeting/modals/acceptance-status', {
                model: this.model
            }, (view) => {
                view.render();

                this.listenTo(view, 'set-status', (status) => {
                    this.removeMenuItem('setAcceptanceStatus');

                    Espo.Ajax.postRequest(this.model.entityType + '/action/setAcceptanceStatus', {
                        id: this.model.id,
                        status: status,
                    }).then(() => {
                        this.model.fetch();
                    });
                });
            });
        },
    });
});

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

define('crm:views/meeting/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'crm:views/meeting/record/row-actions/default',

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getAcl().checkScope(this.entityType, 'edit')) {
                this.massActionList.push('setHeld');
                this.massActionList.push('setNotHeld');
            }
        },

        actionSetHeld: function (data) {
            let id = data.id;

            if (!id) {
                return;
            }

            let model = this.collection.get(id);

            if (!model) {
                return;
            }

            model.set('status', 'Held');

            this.listenToOnce(model, 'sync', () => {
                Espo.Ui.notify(false);

                this.collection.fetch();
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            model.save();
        },

        actionSetNotHeld: function (data) {
            let id = data.id;

            if (!id) {
                return;
            }

            var model = this.collection.get(id);

            if (!model) {
                return;
            }

            model.set('status', 'Not Held');

            this.listenToOnce(model, 'sync', () => {
                Espo.Ui.notify(false);
                this.collection.fetch();
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            model.save();
        },

        massActionSetHeld: function () {
            Espo.Ui.notify(this.translate('saving', 'messages'));

            let data = {ids: this.checkedList};

            Espo.Ajax.postRequest(this.collection.entityType + '/action/massSetHeld', data)
                .then(() => {
                    Espo.Ui.notify(false);

                    this.listenToOnce(this.collection, 'sync', () => {
                        data.ids.forEach(id => {
                            if (this.collection.get(id)) {
                                this.checkRecord(id);
                            }
                        });
                    });

                    this.collection.fetch();
                });
        },

        massActionSetNotHeld: function () {
            Espo.Ui.notify(this.translate('saving', 'messages'));

            let data = {ids: this.checkedList};

            Espo.Ajax.postRequest(this.collection.entityType + '/action/massSetNotHeld', data)
                .then(() => {
                    Espo.Ui.notify(false);

                    this.listenToOnce(this.collection, 'sync', () => {
                        data.ids.forEach(id => {
                            if (this.collection.get(id)) {
                                this.checkRecord(id);
                            }
                        });
                    });

                    this.collection.fetch();
                });
        },

    });
});

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

define('crm:views/mass-email/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.initFieldsControl();
        },

        initFieldsControl: function () {
            this.listenTo(this.model, 'change:smtpAccount', (model, value, o) => {
                if (!o.ui) {
                    return;
                }

                if (!value || value === 'system') {
                    this.model.set('fromAddress', this.getConfig().get('outboundEmailFromAddress') || '');
                    this.model.set('fromName', this.getConfig().get('outboundEmailFromName') || '');

                    return;
                }

                var smtpAccountView = this.getFieldView('smtpAccount');

                if (!smtpAccountView) {
                    return;
                }

                if (!smtpAccountView.loadedOptionAddresses) {
                    return;
                }

                if (!smtpAccountView.loadedOptionAddresses[value]) {
                    return;
                }

                this.model.set('fromAddress', smtpAccountView.loadedOptionAddresses[value]);
                this.model.set('fromName', smtpAccountView.loadedOptionFromNames[value]);
            });
        },
    });
});

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

define('crm:views/document/modals/select-records', ['views/modals/select-records-with-categories'], function (Dep) {

    return Dep.extend({

        categoryScope: 'DocumentFolder',
        categoryField: 'folder',
        categoryFilterType: 'inCategory',
    });
});

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

define('crm:views/dashlets/options/chart', ['views/dashlets/options/base'], function (Dep) {

    return Dep.extend({

        setupBeforeFinal: function () {
            this.listenTo(this.model, 'change:dateFilter', this.controlDateFilter);
            this.controlDateFilter();
        },

        controlDateFilter: function () {
            if (this.model.get('dateFilter') === 'between') {
                this.showField('dateFrom');
                this.showField('dateTo');
            } else {
                this.hideField('dateFrom');
                this.hideField('dateTo');
            }
        },
    });
});

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

define('crm:views/contact/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/call/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'crm:views/call/record/row-actions/default',

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getAcl().checkScope(this.entityType, 'edit')) {
                this.massActionList.push('setHeld');
                this.massActionList.push('setNotHeld');
            }
        },

        actionSetHeld: function (data) {
            let id = data.id;

            if (!id) {
                return;
            }

            var model = this.collection.get(id);

            if (!model) {
                return;
            }

            model.set('status', 'Held');

            this.listenToOnce(model, 'sync', () => {
                Espo.Ui.notify(false);

                this.collection.fetch();
            });

            Espo.Ui.notify(' ... ');

            model.save();
        },

        actionSetNotHeld: function (data) {
            let id = data.id;

            if (!id) {
                return;
            }

            let model = this.collection.get(id);

            if (!model) {
                return;
            }

            model.set('status', 'Not Held');

            this.listenToOnce(model, 'sync', () => {
                Espo.Ui.notify(false);
                this.collection.fetch();
            });

            Espo.Ui.notify(this.translate('saving', 'messages'));

            model.save();
        },

        massActionSetHeld: function () {
            Espo.Ui.notify(this.translate('saving', 'messages'));

            let data = {};

            data.ids = this.checkedList;

            Espo.Ajax.postRequest(this.collection.entityType + '/action/massSetHeld', data)
                .then(() => {
                    Espo.Ui.notify(false);

                    this.listenToOnce(this.collection, 'sync', () => {
                        data.ids.forEach(id => {
                            if (this.collection.get(id)) {
                                this.checkRecord(id);
                            }
                        });
                    });

                    this.collection.fetch();
                });
        },

        massActionSetNotHeld: function () {
            Espo.Ui.notify(this.translate('saving', 'messages'));

            let data = {};

            data.ids = this.checkedList;

            Espo.Ajax.postRequest(this.collection.entityType + '/action/massSetNotHeld', data)
                .then(() => {
                    Espo.Ui.notify(false);

                    this.listenToOnce(this.collection, 'sync', () => {
                        data.ids.forEach(id => {
                            if (this.collection.get(id)) {
                                this.checkRecord(id);
                            }
                        });
                    });

                    this.collection.fetch();
                });
        },
    });
});

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

define('crm:views/call/fields/contacts', ['crm:views/meeting/fields/contacts'], function (Dep) {

    return Dep.extend({

        getAttributeList: function () {
            let list = Dep.prototype.getAttributeList.call(this);

            list.push('phoneNumbersMap');

            return list;
        },

        getDetailLinkHtml: function (id, name) {
            let html = Dep.prototype.getDetailLinkHtml.call(this, id, name);

            let key = this.foreignScope + '_' + id;
            let phoneNumbersMap = this.model.get('phoneNumbersMap') || {};

            if (!(key in phoneNumbersMap)) {
                return html;
            }

            let number = phoneNumbersMap[key];

            let $item = $(html);

            $item
                .append(
                    ' ',
                    $('<span>').addClass('text-muted chevron-right'),
                    ' ',
                    $('<a>')
                        .attr('href', 'tel:' + number)
                        .attr('data-phone-number', number)
                        .attr('data-action', 'dial')
                        .addClass('small')
                        .text(number)
                )

            return $('<div>')
                .append($item)
                .get(0).outerHTML;
        },
    });
});

define("modules/crm/acl/meeting", ["exports", "acl"], function (_exports, _acl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _acl = _interopRequireDefault(_acl);
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

  class MeetingAcl extends _acl.default {
    // noinspection JSUnusedGlobalSymbols
    checkModelRead(model, data, precise) {
      return this._checkModelCustom('read', model, data, precise);
    }

    // noinspection JSUnusedGlobalSymbols
    checkModelStream(model, data, precise) {
      return this._checkModelCustom('stream', model, data, precise);
    }
    _checkModelCustom(action, model, data, precise) {
      let result = this.checkModel(model, data, action, precise);
      if (result) {
        return true;
      }
      if (data === false) {
        return false;
      }
      let d = data || {};
      if (d[action] === 'no') {
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
  var _default = MeetingAcl;
  _exports.default = _default;
});

define("views/notification/items/base", ["exports", "view"], function (_exports, _view) {
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

  /** @module views/notification/items/base */

  class BaseNotificationItemView extends _view.default {
    /** @type {string} */
    messageName;
    /** @type {string} */
    messageTemplate;
    messageData = null;
    isSystemAvatar = false;
    data() {
      return {
        avatar: this.getAvatarHtml()
      };
    }
    init() {
      this.createField('createdAt', null, null, 'views/fields/datetime-short');
      this.messageData = {};
    }
    createField(name, type, params, view) {
      type = type || this.model.getFieldType(name) || 'base';
      this.createView(name, view || this.getFieldManager().getViewName(type), {
        model: this.model,
        defs: {
          name: name,
          params: params || {}
        },
        selector: '.cell-' + name,
        mode: 'list'
      });
    }
    createMessage() {
      let parentType = this.model.get('relatedParentType') || null;
      if (!this.messageTemplate && this.messageName) {
        this.messageTemplate = this.translate(this.messageName, 'notificationMessages', parentType) || '';
      }
      if (this.messageTemplate.indexOf('{entityType}') === 0 && typeof this.messageData.entityType === 'string') {
        this.messageData.entityTypeUcFirst = Espo.Utils.upperCaseFirst(this.messageData.entityType);
        this.messageTemplate = this.messageTemplate.replace('{entityType}', '{entityTypeUcFirst}');
      }
      this.createView('message', 'views/stream/message', {
        messageTemplate: this.messageTemplate,
        selector: '.message',
        model: this.model,
        messageData: this.messageData
      });
    }
    getAvatarHtml() {
      let id = this.userId;
      if (this.isSystemAvatar || !id) {
        id = this.getHelper().getAppParam('systemUserId');
      }
      return this.getHelper().getAvatarHtml(id, 'small', 20);
    }

    /**
     * @param {string} entityType
     * @param {boolean} [isPlural]
     * @return {string}
     */
    translateEntityType(entityType, isPlural) {
      let string = isPlural ? this.translate(entityType, 'scopeNamesPlural') || '' : this.translate(entityType, 'scopeNames') || '';
      string = string.toLowerCase();
      let language = this.getPreferences().get('language') || this.getConfig().get('language');
      if (~['de_DE', 'nl_NL'].indexOf(language)) {
        string = Espo.Utils.upperCaseFirst(string);
      }
      return string;
    }
  }
  var _default = BaseNotificationItemView;
  _exports.default = _default;
});

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

define('views/lead-capture/fields/smtp-account', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        dataUrl: 'LeadCapture/action/smtpAccountDataList',

        getAttributeList: function () {
            return [this.name, 'inboundEmailId'];
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            data.valueIsSet = true;
            data.isNotEmpty = true;

            return data;
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = [];
            this.translatedOptions = {};

            this.params.options.push('system');

            if (!this.loadedOptionList) {
                if (this.model.get('inboundEmailId')) {
                    var item = 'inboundEmail:' + this.model.get('inboundEmailId');

                    this.params.options.push(item);

                    this.translatedOptions[item] =
                        (this.model.get('inboundEmailName') || this.model.get('inboundEmailId')) +
                        ' (' + this.translate('group', 'labels', 'MassEmail') + ')';
                }
            } else {
                this.loadedOptionList.forEach((item) => {
                    this.params.options.push(item);

                    this.translatedOptions[item] =
                        (this.loadedOptionTranslations[item] || item) +
                        ' (' + this.translate('group', 'labels', 'MassEmail') + ')';
                });
            }

            this.translatedOptions['system'] =
                this.getConfig().get('outboundEmailFromAddress') +
                ' (' + this.translate('system', 'labels', 'MassEmail') + ')';
        },

        getValueForDisplay: function () {
            if (!this.model.has(this.name) && this.isReadMode()) {
                if (this.model.has('inboundEmailId')) {
                    if (this.model.get('inboundEmailId')) {
                        return 'inboundEmail:' + this.model.get('inboundEmailId');
                    } else {
                        return 'system';
                    }
                } else {
                    return '...';
                }
            }

            return this.model.get(this.name);
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            if (
                this.getAcl().checkScope('MassEmail', 'create') ||
                this.getAcl().checkScope('MassEmail', 'edit')
            ) {

                Espo.Ajax.getRequest(this.dataUrl).then(dataList => {
                    if (!dataList.length) {
                        return;
                    }

                    this.loadedOptionList = [];

                    this.loadedOptionTranslations = {};
                    this.loadedOptionAddresses = {};
                    this.loadedOptionFromNames = {};

                    dataList.forEach(item => {
                        this.loadedOptionList.push(item.key);

                        this.loadedOptionTranslations[item.key] = item.emailAddress;
                        this.loadedOptionAddresses[item.key] = item.emailAddress;
                        this.loadedOptionFromNames[item.key] = item.fromName || '';
                    });

                    this.setupOptions();
                    this.reRender();
                });
            }
        },

        fetch: function () {
            var data = {};
            var value = this.$element.val();

            data[this.name] = value;

            if (!value || value === 'system') {
                data.inboundEmailId = null;
                data.inboundEmailName = null;
            }
            else {
                var arr = value.split(':');

                if (arr.length > 1) {
                    data.inboundEmailId = arr[1];
                    data.inboundEmailName = this.translatedOptions[data.inboundEmailId] || data.inboundEmailId;
                }
            }

            return data;
        },
    });
});

define("handlers/create-related", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
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

  /**
   * Prepares attributes for a related record that is being created.
   *
   * @abstract
   */
  class CreateRelatedHandler {
    /**
     * @param {module:view-helper} viewHelper
     */
    constructor(viewHelper) {
      // noinspection JSUnusedGlobalSymbols
      this.viewHelper = viewHelper;
    }

    /**
     * Get attributes for a new record.
     *
     * @abstract
     * @param {module:model} model A model.
     * @return {Promise<Object.<string, *>>} Attributes.
     */
    getAttributes(model) {
      return Promise.resolve({});
    }
  }
  var _default = CreateRelatedHandler;
  _exports.default = _default;
});

define("handlers/row-action", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
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

  /** @module handlers/row-action */

  /**
   * @abstract
   */
  class RowActionHandler {
    /**
     * @param {module:views/record/list} view
     */
    constructor(view) {
      // noinspection JSUnusedGlobalSymbols
      /** @protected */
      this.view = view;

      /**
       * @protected
       * @type {module:collection}
       */
      this.collection = this.view.collection;
    }
    isAvailable(model, action) {
      return true;
    }

    /**
     * @param {module:model} model A model.
     * @param {string} action An action.
     */
    process(model, action) {}
  }
  var _default = RowActionHandler;
  _exports.default = _default;
});

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

define('crm:views/user/record/panels/tasks', ['crm:views/record/panels/tasks'], function (Dep) {

    return Dep.extend({

        listLayout: {
            rows: [
                [
                    {
                        name: 'name',
                        link: true,
                    },
                    {
                        name: 'isOverdue',
                    }
                ],
                [
                    {name: 'status'},
                    {name: 'dateEnd'},
                ],
            ]
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getMetadata().get(['entityDefs', 'Task', 'fields', 'assignedUsers'])) {
                var foreignLink = this.getMetadata().get(['entityDefs', 'Task', 'links', 'assignedUsers', 'foreign']);

                if (foreignLink) {
                    this.link = foreignLink;
                }
            }
        },
    });
});

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

define('crm:views/task/list', ['views/list'], function (Dep) {

    return Dep.extend({
    });
});

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

define('crm:views/task/detail', ['views/detail'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/task/record/list-expanded',
['views/record/list-expanded', 'crm:views/task/record/list'], function (Dep, List) {

    return Dep.extend({

        rowActionsView: 'crm:views/task/record/row-actions/default',

        actionSetCompleted: function (data) {
            List.prototype.actionSetCompleted.call(this, data);
        },
    });
});

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

define('crm:views/task/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);
            if (this.getAcl().checkModel(this.model, 'edit')) {
                if (
                    !~['Completed', 'Canceled'].indexOf(this.model.get('status')) &&
                    this.getAcl().checkField(this.entityType, 'status', 'edit')
                ) {
                    this.dropdownItemList.push({
                        'label': 'Complete',
                        'name': 'setCompleted'
                    });
                }

                this.listenToOnce(this.model, 'sync', function () {
                    if (~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                        this.removeButton('setCompleted');
                    }
                }, this);
            }
        },

        manageAccessEdit: function (second) {
            Dep.prototype.manageAccessEdit.call(this, second);

            if (second) {
                if (!this.getAcl().checkModel(this.model, 'edit', true)) {
                    this.hideActionItem('setCompleted');
                }
            }
        },

        actionSetCompleted: function () {
            this.model.save({status: 'Completed'}, {patch: true})
                .then(() => Espo.Ui.success(this.translate('Saved')));

        },
    });
});

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

define('crm:views/task/record/row-actions/default', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit && !~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setCompleted',
                    label: 'Complete',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType
                    }
                });
            }

            return actionList;
        },
    });
});

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

define('crm:views/task/record/row-actions/dashlet', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit && !~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setCompleted',
                    label: 'Complete',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType
                    }
                });
            }

            return actionList;
        },
    });
});

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

define('crm:views/task/modals/detail', ['views/modals/detail'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/task/fields/priority-for-dashlet', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        data: function () {
            var data = Dep.prototype.data.call(this);

            if (!data.style || data.style === 'default') {
                data.isNotEmpty = false;
            }

            return data;
        },
    });
});

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

define('crm:views/task/fields/is-overdue', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        readOnly: true,

        templateContent: `
            {{#if isOverdue}}
            <span class="label label-danger">{{translate "overdue" scope="Task"}}</span>
            {{/if}}
        `,

        data: function () {
            var isOverdue = false;

            if (['Completed', 'Canceled'].indexOf(this.model.get('status')) === -1) {
                if (this.model.has('dateEnd')) {
                    if (!this.isDate()) {
                        let value = this.model.get('dateEnd');

                        if (value) {
                            let d = this.getDateTime().toMoment(value);
                            let now = moment().tz(this.getDateTime().timeZone || 'UTC');

                            if (d.unix() < now.unix()) {
                                isOverdue = true;
                            }
                        }
                    } else {
                        let value = this.model.get('dateEndDate');

                        if (value) {
                            let d = moment.utc(value + ' 23:59', this.getDateTime().internalDateTimeFormat);
                            let now = this.getDateTime().getNowMoment();

                            if (d.unix() < now.unix()) {
                                isOverdue = true;
                            }
                        }
                    }

                }
            }

            return {
                isOverdue: isOverdue,
            };
        },

        setup: function () {
            this.mode = 'detail';
        },

        isDate: function () {
            var dateValue = this.model.get('dateEnd');

            if (dateValue) {
                return true;
            }

            return false;
        },
    });
});

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

define('crm:views/task/fields/date-end', ['views/fields/datetime-optional'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'crm:task/fields/date-end/detail',
        listTemplate: 'crm:task/fields/date-end/detail',

        isEnd: true,

        data: function () {
            var data = Dep.prototype.data.call(this);

            if (this.model.get('status') && !~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                if (this.mode === 'list' || this.mode === 'detail') {
                    if (!this.isDate()) {
                        let value = this.model.get(this.name);

                        if (value) {
                            let d = this.getDateTime().toMoment(value);
                            let now = moment().tz(this.getDateTime().timeZone || 'UTC');

                            if (d.unix() < now.unix()) {
                                data.isOverdue = true;
                            }
                        }
                    } else {
                        let value = this.model.get(this.nameDate);

                        if (value) {
                            let d = moment.utc(value + ' 23:59', this.getDateTime().internalDateTimeFormat);
                            let now = this.getDateTime().getNowMoment();

                            if (d.unix() < now.unix()) {
                                data.isOverdue = true;
                            }
                        }
                    }
                }
            }

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this, 'change', () => {
                if (!this.model.get('dateEnd')) {
                    if (this.model.get('reminders')) {
                        this.model.set('reminders', []);
                    }
                }
            });
        },
    });
});

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

define('crm:views/target-list/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'after:relate', () => {
                this.model.fetch();
            });

            this.listenTo(this.model, 'after:unrelate', () => {
                this.model.fetch();
            });
        },
    });
});

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

define('crm:views/target-list/record/row-actions/opted-out', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            return [
                {
                    action: 'cancelOptOut',
                    label: 'Cancel Opt-Out',
                    data: {
                        id: this.model.id,
                        type: this.model.entityType,
                    },
                },
            ];
        },
    });
});

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

define('crm:views/target-list/record/row-actions/default', ['views/record/row-actions/relationship'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            const list = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit) {
                if (this.model.get('targetListIsOptedOut')) {
                    list.push({
                        action: 'cancelOptOut',
                        label: 'Cancel Opt-Out',
                        data: {
                            id: this.model.id,
                            type: this.model.entityType,
                        },
                    });
                } else {
                    list.push({
                        action: 'optOut',
                        label: 'Opt-Out',
                        data: {
                            id: this.model.id,
                            type: this.model.entityType,
                        },
                    });
                }
            }

            return list;
        },
    });
});

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

define('crm:views/target-list/record/panels/relationship', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        fetchOnModelAfterRelate: true,

        actionOptOut: function (data) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('TargetList/action/optOut', {
                        id: this.model.id,
                        targetId: data.id,
                        targetType: data.type,
                    })
                    .then(() => {
                        this.collection.fetch();
                        Espo.Ui.success(this.translate('Done'));
                        this.model.trigger('opt-out');
                    });
            });
        },

        actionCancelOptOut: function (data) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('TargetList/action/cancelOptOut', {
                        id: this.model.id,
                        targetId: data.id,
                        targetType: data.type,
                    })
                    .then(() => {
                        this.collection.fetch();
                        Espo.Ui.success(this.translate('Done'));

                        this.collection.fetch();
                        this.model.trigger('cancel-opt-out');
                    });
            });
        },
    });
});

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

define('crm:views/target-list/record/panels/opted-out',  ['views/record/panels/relationship', 'multi-collection'],
function (Dep, MultiCollection) {

    return Dep.extend({

        name: 'optedOut',

        template: 'crm:target-list/record/panels/opted-out',

        scopeList: ['Contact', 'Lead', 'User', 'Account'],

        data: function () {
            return {
                currentTab: this.currentTab,
                scopeList: this.scopeList,
            };
        },

        getStorageKey: function () {
            return 'target-list-opted-out-' + this.model.entityType + '-' + this.name;
        },

        setup: function () {
            this.seeds = {};

            let linkList = this.getMetadata().get(['scopes', 'TargetList', 'targetLinkList']) || [];

            this.scopeList = [];

            linkList.forEach(link => {
                let entityType = this.getMetadata().get(['entityDefs', 'TargetList', 'links', link, 'entity']);

                if (entityType) {
                    this.scopeList.push(entityType);
                }
            });

            this.listLayout = {};

            this.scopeList.forEach(scope => {
                this.listLayout[scope] = {
                    rows: [
                        [
                            {
                                name: 'name',
                                link: true,
                            }
                        ]
                    ]
                };
            });

            if (this.scopeList.length) {
                this.wait(true);

                var i = 0;

                this.scopeList.forEach(scope => {
                    this.getModelFactory().create(scope, seed => {
                        this.seeds[scope] = seed;

                        i++;

                        if (i === this.scopeList.length) {
                            this.wait(false);
                        }
                    });
                });
            }

            this.listenTo(this.model, 'opt-out', () => {
                this.actionRefresh();
            });

            this.listenTo(this.model, 'cancel-opt-out', () => {
                this.actionRefresh();
            });
        },

        afterRender: function () {
            var url = 'TargetList/' + this.model.id + '/' + this.name;

            this.collection = new MultiCollection();
            this.collection.seeds = this.seeds;
            this.collection.url = url;

            this.collection.maxSize = this.getConfig().get('recordsPerPageSmall') || 5;

            this.listenToOnce(this.collection, 'sync', () => {
                this.createView('list', 'views/record/list-expanded', {
                    selector: '> .list-container',
                    pagination: false,
                    type: 'listRelationship',
                    rowActionsView: 'crm:views/target-list/record/row-actions/opted-out',
                    checkboxes: false,
                    collection: this.collection,
                    listLayout: this.listLayout,
                }, view => {
                    view.render();
                });
            });

            this.collection.fetch();
        },

        actionRefresh: function () {
            this.collection.fetch();
        },

        actionCancelOptOut: function (data) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax.postRequest('TargetList/action/cancelOptOut', {
                    id: this.model.id,
                    targetId: data.id,
                    targetType: data.type,
                }).then(() => {
                    this.collection.fetch();
                });
            });
        },
    });
});

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

define('crm:views/target-list/fields/target-status', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            if (this.model.get('isOptedOut')) {
                return this.getLanguage().translateOption('Opted Out', 'targetStatus', 'TargetList');
            }

            return this.getLanguage().translateOption('Listed', 'targetStatus', 'TargetList');
        }
    });
});

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

define('crm:views/target-list/fields/including-action-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = this.getMetadata().get('entityDefs.CampaignLogRecord.fields.action.options') || [];
            this.translatedOptions = {};

            this.params.options.forEach(item => {
                this.translatedOptions[item] = this.getLanguage().translateOption(item, 'action', 'CampaignLogRecord');
            });
        },
    });
});

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

define('crm:views/stream/notes/event-confirmation', ['views/stream/note'], function (Dep) {

    return Dep.extend({

        // language=Handlebars
        templateContent: `
            {{#unless noEdit}}
            <div class="pull-right right-container cell-buttons">
            {{{right}}}
            </div>
            {{/unless}}

            <div class="stream-head-container">
                <div class="pull-left">
                    {{{avatar}}}
                </div>
                <div class="stream-head-text-container">
                    <span class="{{iconClass}} text-{{style}}"></span>
                    <span class="text-muted message">{{{message}}}</span>
                </div>
            </div>
            <div class="stream-date-container">
                <a class="text-muted small" href="#Note/view/{{model.id}}">{{{createdAt}}}</a>
            </div>
        `,

        data: function () {
            let iconClass = ({
                'success': 'fas fa-check fa-sm',
                'danger': 'fas fa-times fa-sm',
                'warning': 'fas fa-question fa-sm',
            })[this.style] || '';

            return _.extend({
                statusText: this.statusText,
                style: this.style,
                iconClass: iconClass,
            }, Dep.prototype.data.call(this));
        },

        init: function () {
            if (this.getUser().isAdmin()) {
                this.isRemovable = true;
            }

            Dep.prototype.init.call(this);
        },

        setup: function () {
            this.inviteeType = this.model.get('relatedType');
            this.inviteeId = this.model.get('relatedId');
            this.inviteeName = this.model.get('relatedName');

            let data = this.model.get('data') || {};

            let status = data.status || 'Tentative';
            this.style = data.style || 'default';
            this.statusText = this.getLanguage().translateOption(status, 'acceptanceStatus', 'Meeting');

            this.messageName = 'eventConfirmation' + status;

            if (this.isThis) {
                this.messageName += 'This';
            }

            this.messageData['invitee'] =
                $('<a>')
                    .attr('href', '#' + this.inviteeType + '/view/' + this.inviteeId)
                    .attr('data-id', this.inviteeId)
                    .attr('data-scope', this.inviteeType)
                    .text(this.inviteeName);

            this.createMessage();
        },
    });
});

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

define('crm:views/record/list-activities-dashlet',
['views/record/list-expanded', 'crm:views/meeting/record/list', 'crm:views/task/record/list'],
function (Dep, MeetingList, TaskList) {

    return Dep.extend({

        actionSetHeld: function (data) {
            MeetingList.prototype.actionSetHeld.call(this, data);
        },

        actionSetNotHeld: function (data) {
            MeetingList.prototype.actionSetNotHeld.call(this, data);
        },

        actionSetCompleted: function (data) {
            TaskList.prototype.actionSetCompleted.call(this, data);
        },
    });
});

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

define('crm:views/record/row-actions/tasks', ['views/record/row-actions/relationship-no-unlink'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                },
                link: '#' + this.model.entityType + '/view/' + this.model.id
            }];

            if (this.options.acl.edit) {
                list.push({
                    action: 'quickEdit',
                    label: 'Edit',
                    data: {
                        id: this.model.id
                    },
                    link: '#' + this.model.entityType + '/edit/' + this.model.id
                });

                if (!~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                    list.push({
                        action: 'Complete',
                        text: this.translate('Complete', 'labels', 'Task'),
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            if (this.options.acl.delete) {
                list.push({
                    action: 'removeRelated',
                    label: 'Remove',
                    data: {
                        id: this.model.id
                    }
                });
            }

            return list;
        },
    });
});

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

define('crm:views/record/row-actions/relationship-target', ['views/record/row-actions/relationship-unlink-only'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var list = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit) {
                if (this.model.get('isOptedOut')) {
                    list.push({
                        action: 'cancelOptOut',
                        text: this.translate('Cancel Opt-Out', 'labels', 'TargetList'),
                        data: {
                            id: this.model.id
                        }
                    });
                } else {
                    list.push({
                        action: 'optOut',
                        text: this.translate('Opt-Out', 'labels', 'TargetList'),
                        data: {
                            id: this.model.id
                        }
                    });
                }
            }

            return list;
        },
    });
});

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

define('crm:views/record/row-actions/history', ['views/record/row-actions/relationship'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id
                },
                link: '#' + this.model.entityType + '/view/' + this.model.id
            }];

            if (this.model.entityType === 'Email') {
                list.push({
                    action: 'reply',
                    text: this.translate('Reply', 'labels', 'Email'),
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.edit) {
                list = list.concat([
                    {
                        action: 'quickEdit',
                        label: 'Edit',
                        data: {
                            id: this.model.id
                        },
                        link: '#' + this.model.entityType + '/edit/' + this.model.id
                    }
                ]);
            }

            if (this.options.acl.delete) {
                list.push({
                    action: 'removeRelated',
                    label: 'Remove',
                    data: {
                        id: this.model.id
                    }
                });
            }

            return list;
        },

    });
});

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

define('crm:views/record/row-actions/activities', ['views/record/row-actions/relationship'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var list = [{
                action: 'quickView',
                label: 'View',
                data: {
                    id: this.model.id,
                },
                link: '#' + this.model.entityType + '/view/' + this.model.id,
            }];

            if (this.options.acl.edit) {
                list.push({
                    action: 'quickEdit',
                    label: 'Edit',
                    data: {
                        id: this.model.id,
                    },
                    link: '#' + this.model.entityType + '/edit/' + this.model.id,
                });

                if (this.model.entityType === 'Meeting' || this.model.entityType === 'Call') {
                    list.push({
                        action: 'setHeld',
                        text: this.translate('Set Held', 'labels', 'Meeting'),
                        data: {
                            id: this.model.id,
                        },
                    });

                    list.push({
                        action: 'setNotHeld',
                        text: this.translate('Set Not Held', 'labels', 'Meeting'),
                        data: {
                            id: this.model.id,
                        },
                    });
                }
            }

            if (this.options.acl.delete) {
                list.push({
                    action: 'removeRelated',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                    }
                });
            }

            return list;
        },
    });
});

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

define('crm:views/record/row-actions/activities-dashlet', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            var scope = this.model.entityType;

            actionList.forEach(function (item) {
                item.data = item.data || {};
                item.data.scope = this.model.entityType;
            }, this);

            if (scope === 'Task') {
                if (this.options.acl.edit && !~['Completed', 'Canceled'].indexOf(this.model.get('status'))) {
                    actionList.push({
                        action: 'setCompleted',
                        label: 'Complete',
                        data: {
                            id: this.model.id
                        }
                    });
                }
            } else {
                if (this.options.acl.edit && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                    actionList.push({
                        action: 'setHeld',
                        label: 'Set Held',
                        data: {
                            id: this.model.id,
                            scope: this.model.entityType
                        }
                    });
                    actionList.push({
                        action: 'setNotHeld',
                        label: 'Set Not Held',
                        data: {
                            id: this.model.id,
                            scope: this.model.entityType
                        }
                    });
                }
            }

            if (this.options.acl.edit) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType
                    }
                });
            }

            return actionList;
        },
    });
});

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

define('crm:views/record/panels/target-lists', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        actionOptOut: function (data) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('TargetList/action/optOut', {
                        id: data.id,
                        targetId: this.model.id,
                        targetType: this.model.entityType,
                    })
                    .then(() => {
                        this.collection.fetch();
                        Espo.Ui.success(this.translate('Done'));
                        this.model.trigger('opt-out');
                    });
            });
        },

        actionCancelOptOut: function (data) {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('TargetList/action/cancelOptOut', {
                        id: data.id,
                        targetId: this.model.id,
                        targetType: this.model.entityType,
                    })
                    .then(() => {
                        this.collection.fetch();
                        Espo.Ui.success(this.translate('Done'));
                        this.model.trigger('cancel-opt-out');
                    });
            });
        },
    });
});

define("modules/crm/views/record/panels/history", ["exports", "crm:views/record/panels/activities", "email-helper"], function (_exports, _activities, _emailHelper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _activities = _interopRequireDefault(_activities);
  _emailHelper = _interopRequireDefault(_emailHelper);
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

  class HistoryPanelView extends _activities.default {
    name = 'history';
    orderBy = 'dateStart';
    orderDirection = 'desc';
    rowActionsView = 'crm:views/record/row-actions/history';
    actionList = [];
    listLayout = {
      'Email': {
        rows: [[{
          name: 'ico',
          view: 'crm:views/fields/ico'
        }, {
          name: 'name',
          link: true
        }], [{
          name: 'status'
        }, {
          name: 'dateSent'
        }, {
          name: 'hasAttachment',
          view: 'views/email/fields/has-attachment'
        }]]
      }
    };
    where = {
      scope: false
    };
    setupActionList() {
      super.setupActionList();
      this.actionList.push({
        action: 'archiveEmail',
        label: 'Archive Email',
        acl: 'create',
        aclScope: 'Email'
      });
    }
    getArchiveEmailAttributes(scope, data, callback) {
      let attributes = {
        dateSent: this.getDateTime().getNow(15),
        status: 'Archived',
        from: this.model.get('emailAddress'),
        to: this.getUser().get('emailAddress')
      };
      if (this.model.entityType === 'Contact') {
        if (this.getConfig().get('b2cMode')) {
          attributes.parentType = 'Contact';
          attributes.parentName = this.model.get('name');
          attributes.parentId = this.model.id;
        } else {
          if (this.model.get('accountId')) {
            attributes.parentType = 'Account';
            attributes.parentId = this.model.get('accountId');
            attributes.parentName = this.model.get('accountName');
          }
        }
      } else if (this.model.entityType === 'Lead') {
        attributes.parentType = 'Lead';
        attributes.parentId = this.model.id;
        attributes.parentName = this.model.get('name');
      }
      attributes.nameHash = {};
      attributes.nameHash[this.model.get('emailAddress')] = this.model.get('name');
      if (scope) {
        if (!attributes.parentId) {
          if (this.checkParentTypeAvailability(scope, this.model.entityType)) {
            attributes.parentType = this.model.entityType;
            attributes.parentId = this.model.id;
            attributes.parentName = this.model.get('name');
          }
        } else {
          if (attributes.parentType && !this.checkParentTypeAvailability(scope, attributes.parentType)) {
            attributes.parentType = null;
            attributes.parentId = null;
            attributes.parentName = null;
          }
        }
      }
      callback.call(this, attributes);
    }

    // noinspection JSUnusedGlobalSymbols
    actionArchiveEmail(data) {
      let scope = 'Email';
      let relate = null;
      if ('emails' in this.model.defs['links']) {
        relate = {
          model: this.model,
          link: this.model.defs['links']['emails'].foreign
        };
      }
      Espo.Ui.notify(' ... ');
      let viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.edit') || 'views/modals/edit';
      this.getArchiveEmailAttributes(scope, data, attributes => {
        this.createView('quickCreate', viewName, {
          scope: scope,
          relate: relate,
          attributes: attributes
        }, view => {
          view.render();
          view.notify(false);
          this.listenToOnce(view, 'after:save', () => {
            this.collection.fetch();
            this.model.trigger('after:relate');
          });
        });
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionReply(data) {
      let id = data.id;
      if (!id) {
        return;
      }
      let emailHelper = new _emailHelper.default(this.getLanguage(), this.getUser(), this.getDateTime(), this.getAcl());
      Espo.Ui.notify(' ... ');
      this.getModelFactory().create('Email').then(model => {
        model.id = id;
        model.fetch().then(() => {
          let attributes = emailHelper.getReplyAttributes(model, data, this.getPreferences().get('emailReplyToAllByDefault'));
          let viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
          return this.createView('quickCreate', viewName, {
            attributes: attributes,
            focusForCreate: true
          });
        }).then(view => {
          view.render();
          this.listenToOnce(view, 'after:save', () => {
            this.collection.fetch();
            this.model.trigger('after:relate');
          });
          Espo.Ui.notify(false);
        });
      });
    }
  }
  var _default = HistoryPanelView;
  _exports.default = _default;
});

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

define('crm:views/opportunity/detail', ['views/detail'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/opportunity/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

    });
});

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

define('crm:views/opportunity/record/kanban', ['views/record/kanban'], function (Dep) {

    return Dep.extend({

        handleAttributesOnGroupChange: function (model, attributes, group) {
            if (this.statusField !== 'stage') {
                return;
            }

            var probability = this.getMetadata()
                .get(['entityDefs', 'Opportunity', 'fields', 'stage', 'probabilityMap', group]);

            probability = parseInt(probability);
            attributes['probability'] = probability;
        },
    });
});

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

define('crm:views/opportunity/record/edit-small',
['views/record/edit-small', 'crm:views/opportunity/record/edit'], function (Dep, Edit) {

    return Dep.extend({

        populateDefaults: function () {
            Dep.prototype.populateDefaults.call(this);
            Edit.prototype.populateDefaults.call(this);
        }
    });
});


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

define('crm:views/opportunity/record/panels/activities', ['crm:views/record/panels/activities'], function (Dep) {

    return Dep.extend({

        getComposeEmailAttributes: function (scope, data, callback) {
            data = data || {};

            Espo.Ui.notify(' ... ');

            Dep.prototype.getComposeEmailAttributes.call(this, scope, data, (attributes) => {
                Espo.Ajax.getRequest('Opportunity/action/emailAddressList?id=' + this.model.id).then(list => {
                    attributes.to = '';
                    attributes.cc = '';
                    attributes.nameHash = {};

                    list.forEach((item, i) => {
                        attributes.to += item.emailAddress + ';';
                        attributes.nameHash[item.emailAddress] = item.name;
                    });

                    Espo.Ui.notify(false);

                    callback.call(this, attributes);

                });
            })
        },
    });
});

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

define('crm:views/opportunity/fields/stage', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.probabilityMap = this.getMetadata().get('entityDefs.Opportunity.fields.stage.probabilityMap') || {};

            if (this.mode !== 'list') {
                this.on('change', () => {
                    var probability = this.probabilityMap[this.model.get(this.name)];

                    if (probability !== null && probability !== undefined) {
                        this.model.set('probability', probability);
                    }
                });
            }
        },
    });
});

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

define('crm:views/opportunity/fields/lead-source', ['views/fields/enum'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/opportunity/fields/last-stage', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            var optionList = this.getMetadata().get('entityDefs.Opportunity.fields.stage.options', []);
            var probabilityMap = this.getMetadata().get('entityDefs.Opportunity.fields.stage.probabilityMap', {});

            this.params.options = [];

            optionList.forEach(item => {
                if (!probabilityMap[item]) {
                    return;
                }

                if (probabilityMap[item] === 100) {
                    return;
                }

                this.params.options.push(item);
            });

            this.params.translation = 'Opportunity.options.stage';

            Dep.prototype.setup.call(this);
        },
    });
});

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

define('crm:views/opportunity/fields/contacts',
['views/fields/link-multiple-with-columns-with-primary'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/opportunity/fields/contact-role', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        searchTypeList: ['anyOf', 'noneOf'],
    });
});

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

define('crm:views/opportunity/admin/field-manager/fields/probability-map', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'crm:opportunity/admin/field-manager/fields/probability-map/edit',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:options', function (m, v, o) {
                let probabilityMap = this.model.get('probabilityMap') || {}

                if (o.ui) {
                    (this.model.get('options') || []).forEach(item => {
                        if (!(item in probabilityMap)) {
                            probabilityMap[item] = 50;
                        }
                    });

                    this.model.set('probabilityMap', probabilityMap);
                }

                this.reRender();
            });
        },

        data: function () {
            let data = {};

            let values = this.model.get('probabilityMap') || {};

            data.stageList = this.model.get('options') || [];
            data.values = values;

            return data;
        },

        fetch: function () {
            let data = {
                probabilityMap: {},
            };

            (this.model.get('options') || []).forEach(item => {
                data.probabilityMap[item] = parseInt(this.$el.find('input[data-name="'+item+'"]').val());
            });

            return data;
        },

        afterRender: function () {
            this.$el.find('input').on('change', () => {
                this.trigger('change')
            });
        },
    });
});

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

define('crm:views/notification/items/event-attendee', ['views/notification/items/base'], function (Dep) {

    return Dep.extend({

        messageName: 'eventAttendee',

        templateContent: `
            <div class="stream-head-container">
                <div class="pull-left">{{{avatar}}}</div>
                <div class="stream-head-text-container">
                    <span class="text-muted message">{{{message}}}</span>
                </div>
            </div>
            <div class="stream-date-container">
                <span class="text-muted small">{{{createdAt}}}</span>
            </div>
        `,

        setup: function () {
            let data = this.model.get('data') || {};

            this.userId = data.userId;

            this.messageData['entityType'] = this.translateEntityType(data.entityType);

            this.messageData['entity'] =
                $('<a>')
                    .attr('href', '#' + data.entityType + '/view/' + data.entityId)
                    .attr('data-id', data.entityId)
                    .attr('data-scope', data.entityType)
                    .text(data.entityName);

            this.messageData['user'] =
                $('<a>')
                    .attr('href', '#User/view/' + data.userId)
                    .attr('data-id', data.userId)
                    .attr('data-scope', 'User')
                    .text(data.userName);

            this.createMessage();
        },
    });
});

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

define('crm:views/meeting/record/list-expanded',
['views/record/list-expanded', 'crm:views/meeting/record/list'], function (Dep, List) {

    return Dep.extend({

        actionSetHeld: function (data) {
            List.prototype.actionSetHeld.call(this, data);
        },

        actionSetNotHeld: function (data) {
            List.prototype.actionSetNotHeld.call(this, data);
        },
    });
});

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

define('crm:views/meeting/record/edit-small', ['views/record/edit'], function (Dep) {

    return Dep.extend({

    });
});


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

define('crm:views/meeting/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);
            if (this.getAcl().checkModel(this.model, 'edit')) {
                if (
                    ['Held', 'Not Held'].indexOf(this.model.get('status')) === -1 &&
                    this.getAcl().checkField(this.entityType, 'status', 'edit')
                ) {
                    this.dropdownItemList.push({
                        'label': 'Set Held',
                        'name': 'setHeld'
                    });

                    this.dropdownItemList.push({
                        'label': 'Set Not Held',
                        'name': 'setNotHeld'
                    });
                }
            }
        },

        manageAccessEdit: function (second) {
            Dep.prototype.manageAccessEdit.call(this, second);

            if (second) {
                if (!this.getAcl().checkModel(this.model, 'edit', true)) {
                    this.hideActionItem('setHeld');
                    this.hideActionItem('setNotHeld');
                }
            }
        },

        actionSetHeld: function () {
            this.model.save({status: 'Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },

        actionSetNotHeld: function () {
            this.model.save({status: 'Not Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },
    });
});


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

define('crm:views/meeting/record/row-actions/default', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            actionList.forEach(item => {
                item.data = item.data || {};
                item.data.scope = this.model.entityType;
            });

            if (this.options.acl.edit && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setHeld',
                    label: 'Set Held',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });

                actionList.push({
                    action: 'setNotHeld',
                    label: 'Set Not Held',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });
            }

            return actionList;
        }
    });
});

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

define('crm:views/meeting/record/row-actions/dashlet', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            actionList.forEach(item => {
                item.data = item.data || {};
                item.data.scope = this.model.entityType;
            });

            if (this.options.acl.edit && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setHeld',
                    label: 'Set Held',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });

                actionList.push({
                    action: 'setNotHeld',
                    label: 'Set Not Held',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType,
                    }
                });
            }

            return actionList;
        }
    });
});

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

define('crm:views/meeting/record/panels/scheduler', ['views/record/panels/bottom'], function (Dep) {

    return Dep.extend({

        templateContent: '<div class="scheduler-container no-margin">{{{scheduler}}}</div>',

        setup: function () {
            Dep.prototype.setup.call(this);

            var viewName = this.getMetadata().get(['clientDefs', this.scope, 'schedulerView']) ||
                'crm:views/scheduler/scheduler';

            this.createView('scheduler', viewName, {
                selector: '.scheduler-container',
                notToRender: true,
                model: this.model,
            });

            this.once('after:render', () => {
                if (this.disabled) {
                    return;
                }

                this.getView('scheduler').render();
                this.getView('scheduler').notToRender = false;
            });

            if (this.defs.disabled) {
                this.once('show', () => {
                    this.getView('scheduler').render();
                    this.getView('scheduler').notToRender = false;
                });
            }
        },

        actionRefresh: function () {
            this.getView('scheduler').reRender();
        },
    });
});

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

define('crm:views/meeting/record/panels/attendees', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

        setupFields: function () {
            this.fieldList = [];

            this.fieldList.push('users');

            if (this.getAcl().check('Contact') && !this.getMetadata().get('scopes.Contact.disabled')) {
                this.fieldList.push('contacts');
            }

            if (this.getAcl().check('Lead') && !this.getMetadata().get('scopes.Lead.disabled')) {
                this.fieldList.push('leads');
            }
        },
    });
});

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

define('crm:views/meeting/modals/send-invitations', ['views/modal', 'collection'], function (Dep, Collection) {
    /**
     * @module crm_views/meeting/modals/send-invitations
     */

    /**
     * @class
     * @name Class
     * @extends module:views/modal
     * @memberOf module:crm_views/meeting/modals/send-invitations
     */
    return Dep.extend(/** @lends module:crm_views/meeting/modals/send-invitations.Class# */{

        backdrop: true,

        templateContent: `
            <div class="margin-bottom">
                <p>{{message}}</p>
            </div>
            <div class="list-container">{{{list}}}</div>
        `,

        data: function () {
            return {
                message: this.translate('sendInvitationsToSelectedAttendees', 'messages', 'Meeting'),
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.shortcutKeys = {};
            this.shortcutKeys['Control+Enter'] = e => {
                if (!this.hasAvailableActionItem('send')) {
                    return;
                }

                e.preventDefault();

                this.actionSend();
            };

            this.$header = $('<span>').append(
                $('<span>')
                    .text(this.translate(this.model.entityType, 'scopeNames')),
                ' <span class="chevron-right"></span> ',
                $('<span>')
                    .text(this.model.get('name')),
                ' <span class="chevron-right"></span> ',
                $('<span>')
                    .text(this.translate('Send Invitations', 'labels', 'Meeting'))
            );

            this.addButton({
                label: 'Send',
                name: 'send',
                style: 'danger',
                disabled: true,
            });

            this.addButton({
                label: 'Cancel',
                name: 'cancel',
            });

            this.collection = new Collection();
            this.collection.url = this.model.entityType + `/${this.model.id}/attendees`;

            this.wait(
                this.collection.fetch()
                    .then(() => {
                        Espo.Utils.clone(this.collection.models).forEach(model => {
                            model.entityType = model.get('_scope');

                            if (!model.get('emailAddress')) {
                                this.collection.remove(model.id);
                            }
                        });

                        return this.createView('list', 'views/record/list', {
                            selector: '.list-container',
                            collection: this.collection,
                            rowActionsDisabled: true,
                            massActionsDisabled: true,
                            checkAllResultDisabled: true,
                            selectable: true,
                            buttonsDisabled: true,
                            listLayout: [
                                {
                                    name: 'name',
                                    customLabel: this.translate('name', 'fields'),
                                    notSortable: true,
                                },
                                {
                                    name: 'acceptanceStatus',
                                    width: 40,
                                    customLabel: this.translate('acceptanceStatus', 'fields', 'Meeting'),
                                    notSortable: true,
                                    view: 'views/fields/enum',
                                    params: {
                                        options: this.model.getFieldParam('acceptanceStatus', 'options'),
                                        style: this.model.getFieldParam('acceptanceStatus', 'style'),
                                    },
                                },
                            ],
                        })
                    })
                    .then(view => {
                        this.collection.models
                            .filter(model => {
                                let status = model.get('acceptanceStatus');

                                return !status || status === 'None';
                            })
                            .forEach(model => {
                                this.getListView().checkRecord(model.id);
                            });

                        this.listenTo(view, 'check', () => this.controlSendButton());

                        this.controlSendButton();
                    })
            );
        },

        controlSendButton: function () {
            this.getListView().checkedList.length ?
                this.enableButton('send') :
                this.disableButton('send');
        },

        /**
         * @return {module:views/record/list}
         */
        getListView: function () {
            return this.getView('list');
        },

        actionSend: function () {
            this.disableButton('send');

            Espo.Ui.notify(' ... ');

            let targets = this.getListView().checkedList.map(id => {
                return {
                    entityType: this.collection.get(id).entityType,
                    id: id,
                };
            });

            Espo.Ajax
                .postRequest(this.model.entityType + '/action/sendInvitations', {
                    id: this.model.id,
                    targets: targets,
                })
                .then(result => {
                    result ?
                        Espo.Ui.success(this.translate('Sent')) :
                        Espo.Ui.warning(this.translate('nothingHasBeenSent', 'messages', 'Meeting'));

                    this.trigger('sent');

                    this.close();
                })
                .catch(() => {
                    this.enableButton('send');
                });
        },
    });
});

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

define('crm:views/meeting/modals/send-cancellation', ['views/modal', 'collection'], function (Dep, Collection) {
    /**
     * @module crm_views/meeting/modals/send-cancellation
     */

    /**
     * @class
     * @name Class
     * @extends module:views/modal
     * @memberOf module:crm_views/meeting/modals/send-cancellation
     */
    return Dep.extend(/** @lends module:crm_views/meeting/modals/send-cancellation.Class# */{

        backdrop: true,

        templateContent: `
            <div class="margin-bottom">
                <p>{{message}}</p>
            </div>
            <div class="list-container">{{{list}}}</div>
        `,

        data: function () {
            return {
                message: this.translate('sendCancellationsToSelectedAttendees', 'messages', 'Meeting'),
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.shortcutKeys = {};
            this.shortcutKeys['Control+Enter'] = e => {
                if (!this.hasAvailableActionItem('send')) {
                    return;
                }

                e.preventDefault();

                this.actionSend();
            };

            this.$header = $('<span>').append(
                $('<span>')
                    .text(this.translate(this.model.entityType, 'scopeNames')),
                ' <span class="chevron-right"></span> ',
                $('<span>')
                    .text(this.model.get('name')),
                ' <span class="chevron-right"></span> ',
                $('<span>')
                    .text(this.translate('Send Cancellation', 'labels', 'Meeting'))
            );

            this.addButton({
                label: 'Send',
                name: 'send',
                style: 'danger',
                disabled: true,
            });

            this.addButton({
                label: 'Cancel',
                name: 'cancel',
            });

            this.collection = new Collection();
            this.collection.url = this.model.entityType + `/${this.model.id}/attendees`;

            this.wait(
                this.collection.fetch()
                    .then(() => {
                        Espo.Utils.clone(this.collection.models).forEach(model => {
                            model.entityType = model.get('_scope');

                            if (!model.get('emailAddress')) {
                                this.collection.remove(model.id);
                            }
                        });

                        return this.createView('list', 'views/record/list', {
                            selector: '.list-container',
                            collection: this.collection,
                            rowActionsDisabled: true,
                            massActionsDisabled: true,
                            checkAllResultDisabled: true,
                            selectable: true,
                            buttonsDisabled: true,
                            listLayout: [
                                {
                                    name: 'name',
                                    customLabel: this.translate('name', 'fields'),
                                    notSortable: true,
                                },
                                {
                                    name: 'acceptanceStatus',
                                    width: 40,
                                    customLabel: this.translate('acceptanceStatus', 'fields', 'Meeting'),
                                    notSortable: true,
                                    view: 'views/fields/enum',
                                    params: {
                                        options: this.model.getFieldParam('acceptanceStatus', 'options'),
                                        style: this.model.getFieldParam('acceptanceStatus', 'style'),
                                    },
                                },
                            ],
                        })
                    })
                    .then(view => {
                        this.collection.models
                            .filter(model => {
                                if (model.id === this.getUser().id && model.entityType === 'User') {
                                    return false;
                                }

                                return true;
                            })
                            .forEach(model => {
                                this.getListView().checkRecord(model.id);
                            });

                        this.listenTo(view, 'check', () => this.controlSendButton());

                        this.controlSendButton();
                    })
            );
        },

        controlSendButton: function () {
            this.getListView().checkedList.length ?
                this.enableButton('send') :
                this.disableButton('send');
        },

        /**
         * @return {module:views/record/list}
         */
        getListView: function () {
            return this.getView('list');
        },

        actionSend: function () {
            this.disableButton('send');

            Espo.Ui.notify(' ... ');

            let targets = this.getListView().checkedList.map(id => {
                return {
                    entityType: this.collection.get(id).entityType,
                    id: id,
                };
            });

            Espo.Ajax
                .postRequest(this.model.entityType + '/action/sendCancellation', {
                    id: this.model.id,
                    targets: targets,
                })
                .then(result => {
                    result ?
                        Espo.Ui.success(this.translate('Sent')) :
                        Espo.Ui.warning(this.translate('nothingHasBeenSent', 'messages', 'Meeting'));

                    this.trigger('sent');

                    this.close();
                })
                .catch(() => {
                    this.enableButton('send');
                });
        },
    });
});

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

define('crm:views/meeting/modals/detail', ['views/modals/detail', 'lib!moment'], function (Dep, moment) {

    return Dep.extend({

        duplicateAction: true,

        setupAfterModelCreated: function () {
            Dep.prototype.setupAfterModelCreated.call(this);

            let buttonData = this.getAcceptanceButtonData();

            this.addButton({
                name: 'setAcceptanceStatus',
                html: buttonData.html,
                hidden: this.hasAcceptanceStatusButton(),
                style: buttonData.style,
                className: 'btn-text',
                pullLeft: true,
            }, 'cancel');

            if (
                !~this.getAcl().getScopeForbiddenFieldList(this.model.entityType).indexOf('status')
            ) {
                this.addDropdownItem({
                    name: 'setHeld',
                    text: this.translate('Set Held', 'labels', this.model.entityType),
                    hidden: true,
                });

                this.addDropdownItem({
                    name: 'setNotHeld',
                    text: this.translate('Set Not Held', 'labels', this.model.entityType),
                    hidden: true,
                });
            }

            this.addDropdownItem({
                name: 'sendInvitations',
                text: this.translate('Send Invitations', 'labels', 'Meeting'),
                hidden: !this.isSendInvitationsToBeDisplayed(),
            });

            this.initAcceptanceStatus();

            this.on('switch-model', (model, previousModel) => {
                this.stopListening(previousModel, 'sync');
                this.initAcceptanceStatus();
            });

            this.on('after:save', () => {
                if (this.hasAcceptanceStatusButton()) {
                    this.showAcceptanceButton();
                } else {
                    this.hideAcceptanceButton();
                }

                if (this.isSendInvitationsToBeDisplayed()) {
                    this.showActionItem('sendInvitations');
                } else {
                    this.hideActionItem('sendInvitations');
                }
            });

            this.listenTo(this.model, 'sync', () => {
                if (this.isSendInvitationsToBeDisplayed()) {
                    this.showActionItem('sendInvitations');

                    return;
                }

                this.hideActionItem('sendInvitations');
            });

            this.listenTo(this.model, 'after:save', () => {
                if (this.isSendInvitationsToBeDisplayed()) {
                    this.showActionItem('sendInvitations');

                    return;
                }

                this.hideActionItem('sendInvitations');
            });
        },

        controlRecordButtonsVisibility: function () {
            Dep.prototype.controlRecordButtonsVisibility.call(this);

            this.controlStatusActionVisibility();
        },

        controlStatusActionVisibility: function () {
            if (this.getAcl().check(this.model, 'edit') && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                this.showActionItem('setHeld');
                this.showActionItem('setNotHeld');
            } else {
                this.hideActionItem('setHeld');
                this.hideActionItem('setNotHeld');
            }
        },

        hasSetStatusButton: function () {

        },

        initAcceptanceStatus: function () {
            if (this.hasAcceptanceStatusButton()) {
                this.showAcceptanceButton();
            } else {
                this.hideAcceptanceButton();
            }

            this.listenTo(this.model, 'sync', () => {
                if (this.hasAcceptanceStatusButton()) {
                    this.showAcceptanceButton();
                } else {
                    this.hideAcceptanceButton();
                }
            });
        },

        getAcceptanceButtonData: function () {
            let acceptanceStatus = this.model.getLinkMultipleColumn('users', 'status', this.getUser().id);

            let text;
            let style = 'default';

            let iconHtml = null;

            if (acceptanceStatus && acceptanceStatus !== 'None') {
                text = this.getLanguage().translateOption(acceptanceStatus, 'acceptanceStatus', this.model.entityType);

                style = this.getMetadata()
                    .get(['entityDefs', this.model.entityType,
                        'fields', 'acceptanceStatus', 'style', acceptanceStatus]);

                if (style) {
                    let iconClass = ({
                        'success': 'fas fa-check-circle',
                        'danger': 'fas fa-times-circle',
                        'warning': 'fas fa-question-circle',
                    })[style];

                    iconHtml = $('<span>')
                        .addClass(iconClass)
                        .addClass('text-' + style)
                        .get(0).outerHTML;
                }
            } else {
                text = typeof acceptanceStatus !== 'undefined' ?
                    this.translate('Acceptance', 'labels', 'Meeting') :
                    ' ';
            }

            let html = this.getHelper().escapeString(text);

            if (iconHtml) {
                html = iconHtml + ' ' + html;
            }

            return {
                style: style,
                text: text,
                html: html,
            };
        },

        showAcceptanceButton: function () {
            this.showActionItem('setAcceptanceStatus');

            if (!this.isRendered()) {
                this.once('after:render', this.showAcceptanceButton, this);

                return;
            }

            let data = this.getAcceptanceButtonData();

            let $button = this.$el.find('.modal-footer [data-name="setAcceptanceStatus"]');

            $button.html(data.html);

            $button.removeClass('btn-default');
            $button.removeClass('btn-success');
            $button.removeClass('btn-warning');
            $button.removeClass('btn-info');
            $button.removeClass('btn-primary');
            $button.removeClass('btn-danger');
            $button.addClass('btn-' + data.style);
        },

        hideAcceptanceButton: function () {
            this.hideActionItem('setAcceptanceStatus');
        },

        hasAcceptanceStatusButton: function () {
            if (!this.model.has('status')) {
                return false;
            }

            if (!this.model.has('usersIds')) {
                return false;
            }

            if (~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                return false;
            }

            if (!~this.model.getLinkMultipleIdList('users').indexOf(this.getUser().id)) {
                return false;
            }
            return true;
        },

        actionSetAcceptanceStatus: function () {
            this.createView('dialog', 'crm:views/meeting/modals/acceptance-status', {
                model: this.model,
            }, (view) => {
                view.render();

                this.listenTo(view, 'set-status', (status) => {
                    this.hideAcceptanceButton();

                    Espo.Ajax.postRequest(this.model.entityType + '/action/setAcceptanceStatus', {
                        id: this.model.id,
                        status: status,
                    }).then(() => {
                        this.model.fetch()
                            .then(() => {
                                setTimeout(() => {
                                    this.$el.find(`button[data-name="setAcceptanceStatus"]`).focus();
                                }, 50)
                            });
                    });
                });
            });
        },

        actionSetHeld: function () {
            this.model.save({status: 'Held'});
            this.trigger('after:save', this.model);
        },

        actionSetNotHeld: function () {
            this.model.save({status: 'Not Held'});
            this.trigger('after:save', this.model);
        },

        isSendInvitationsToBeDisplayed: function () {
            if (~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                return false;
            }

            let dateEnd = this.model.get('dateEnd');

            if (
                dateEnd &&
                this.getDateTime().toMoment(dateEnd).isBefore(moment.now())
            ) {
                return false;
            }

            if (!this.getAcl().checkModel(this.model, 'edit')) {
                return false;
            }

            let userIdList = this.model.getLinkMultipleIdList('users');
            let contactIdList = this.model.getLinkMultipleIdList('contacts');
            let leadIdList = this.model.getLinkMultipleIdList('leads');

            if (!contactIdList.length && !leadIdList.length && !userIdList.length) {
                return false;
            }

            return true;
        },

        actionSendInvitations: function () {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'crm:views/meeting/modals/send-invitations', {
                model: this.model,
            }).then(view => {
                Espo.Ui.notify(false);

                view.render();

                this.listenToOnce(view, 'sent', () => this.model.fetch());
            });
        },
    });
});

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

define('crm:views/meeting/modals/acceptance-status', ['views/modal'], function (Dep) {

    return Dep.extend({

        backdrop: true,

        templateContent: `
            <div class="margin-bottom">
            <p>{{viewObject.message}}</p>
            </div>
            <div>
                {{#each viewObject.statusDataList}}
                <div class="margin-bottom">
                    <div>
                        <button
                            class="action btn btn-{{style}} btn-x-wide"
                            type="button"
                            data-action="setStatus"
                            data-status="{{name}}"
                        >
                        {{label}}
                        </button>
                        {{#if selected}}<span class="check-icon fas fa-check" style="vertical-align: middle; margin: 0 10px;"></span>{{/if}}
                    </div>
                </div>
                {{/each}}
            </div>
        `,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.$header = $('<span>').append(
                $('<span>').text(this.translate(this.model.entityType, 'scopeNames')),
                ' <span class="chevron-right"></span> ',
                $('<span>').text(this.model.get('name')),
                ' <span class="chevron-right"></span> ',
                $('<span>').text(this.translate('Acceptance', 'labels', 'Meeting'))
            );

            let statusList = this.getMetadata()
                .get(['entityDefs', this.model.entityType, 'fields', 'acceptanceStatus', 'options']) || [];

            this.statusDataList = [];

            statusList.filter(item => item !== 'None').forEach(item => {
                let o = {
                    name: item,
                    style: this.getMetadata()
                        .get(['entityDefs', this.model.entityType, 'fields', 'acceptanceStatus', 'style', item]) ||
                        'default',
                    label: this.getLanguage().translateOption(item, 'acceptanceStatus', this.model.entityType),
                    selected: this.model.getLinkMultipleColumn('users', 'status', this.getUser().id) === item,
                };

                this.statusDataList.push(o);
            });

            this.message = this.translate('selectAcceptanceStatus', 'messages', 'Meeting')
        },

        actionSetStatus: function (data) {
            this.trigger('set-status', data.status);
            this.close();
        },
    });
});

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

define('crm:views/meeting/fields/users', ['crm:views/meeting/fields/attendees'], function (Dep) {

    return Dep.extend({

        selectPrimaryFilterName: 'active',

        init: function () {
            this.assignmentPermission = this.getAcl().getPermissionLevel('assignmentPermission');

            if (this.assignmentPermission === 'no') {
                this.readOnly = true;
            }

            Dep.prototype.init.call(this);
        },

        getSelectBoolFilterList: function () {
            if (this.assignmentPermission === 'team') {
                return ['onlyMyTeam'];
            }
        },

        getIconHtml: function (id) {
            let iconHtml = this.getHelper().getAvatarHtml(id, 'small', 14, 'avatar-link');

            if (iconHtml) {
                iconHtml += ' ';
            }

            return iconHtml;
        },
    });
});

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

define('crm:views/meeting/fields/reminders', ['views/fields/base', 'ui/select', 'lib!moment'],
function (Dep, /** module:ui/select*/Select, moment) {

    return Dep.extend({

        dateField: 'dateStart',

        detailTemplate: 'crm:meeting/fields/reminders/detail',
        listTemplate: 'crm:meeting/fields/reminders/detail',
        editTemplate: 'crm:meeting/fields/reminders/edit',

        events: {
            'click [data-action="addReminder"]': function () {
                let type = this.getMetadata().get('entityDefs.Reminder.fields.type.default');
                let seconds = this.getMetadata().get('entityDefs.Reminder.fields.seconds.default') || 0;

                let item = {
                    type: type,
                    seconds: seconds,
                };

                this.reminderList.push(item);

                this.addItemHtml(item);
                this.trigger('change');

                this.focusOnButton();
            },
            'click [data-action="removeReminder"]': function (e) {
                let $reminder = $(e.currentTarget).closest('.reminder');
                let index = $reminder.index();

                $reminder.remove();

                this.reminderList.splice(index, 1);

                this.focusOnButton();
            },
        },

        getAttributeList: function () {
            return [this.name];
        },

        setup: function () {
            if (this.model.isNew() && !this.model.get(this.name) && this.model.entityType !== 'Preferences') {
                this.reminderList = this.getPreferences().get('defaultReminders') || [];
            } else {
                this.reminderList = this.model.get(this.name) || [];
            }

            this.reminderList = Espo.Utils.cloneDeep(this.reminderList);

            this.listenTo(this.model, 'change:' + this.name, () => {
                this.reminderList = Espo.Utils
                    .cloneDeep(this.model.get(this.name) || []);
            });

            this.typeList = Espo.Utils
                .clone(this.getMetadata().get('entityDefs.Reminder.fields.type.options') || []);
            this.secondsList = Espo.Utils
                .clone(this.getMetadata().get('entityDefs.Reminder.fields.seconds.options') || []);

            this.dateField = this.model.getFieldParam(this.name, 'dateField') || this.dateField;

            this.listenTo(this.model, 'change:' + this.dateField, (m, v, o) => {
                if (this.isEditMode()) {
                    this.reRender();
                }
            });
        },

        afterRender: function () {
            if (this.isEditMode()) {
                this.$container = this.$el.find('.reminders-container');

                this.reminderList.forEach(item => {
                    this.addItemHtml(item);
                });
            }
        },

        focusOnButton: function () {
            this.$el.find('button[data-action="addReminder"]')
                .get(0)
                .focus({preventScroll: true});
        },

        updateType: function (type, index) {
            this.reminderList[index].type = type;
            this.trigger('change');
        },

        updateSeconds: function (seconds, index) {
            this.reminderList[index].seconds = seconds;
            this.trigger('change');
        },

        addItemHtml: function (item) {
            let $item = $('<div>').addClass('input-group').addClass('reminder');

            let $type = $('<select>')
                .attr('name', 'type')
                .attr('data-name', 'type')
                .addClass('form-control');

            this.typeList.forEach(type => {
                let $o = $('<option>')
                    .attr('value', type)
                    .text(this.getLanguage().translateOption(type, 'reminderTypes'));

                $type.append($o);
            });

            $type.val(item.type)
                .addClass('radius-left');

            $type.on('change', () => {
                this.updateType($type.val(), $type.closest('.reminder').index());
            });

            let $seconds = $('<select>')
                .attr('name', 'seconds')
                .attr('data-name', 'seconds')
                .addClass('form-control radius-right');

            let limitDate = this.model.get(this.dateField) ?
                this.getDateTime().toMoment(this.model.get(this.dateField)) : null;

            /** @var {Number[]} secondsList */
            let secondsList = Espo.Utils.clone(this.secondsList);

            if (!secondsList.includes(item.seconds)) {
                secondsList.push(item.seconds);
            }

            secondsList
                .filter(seconds => {
                    return seconds === item.seconds || !limitDate ||
                        this.isBefore(seconds, limitDate);
                })
                .sort((a, b) => a - b)
                .forEach(seconds => {
                    let $o = $('<option>')
                        .attr('value', seconds)
                        .text(this.stringifySeconds(seconds));

                    $seconds.append($o);
                });

            $seconds.val(item.seconds);

            $seconds.on('change', () => {
                let seconds = parseInt($seconds.val());
                let index = $seconds.closest('.reminder').index();

                this.updateSeconds(seconds, index);
            });

            let $remove = $('<button>')
                .addClass('btn')
                .addClass('btn-link')
                .css('margin-left', '5px')
                .attr('type', 'button')
                .attr('data-action', 'removeReminder')
                .html('<span class="fas fa-times"></span>');

            $item
                .append($('<div class="input-group-item">').append($type))
                .append($('<div class="input-group-item">').append($seconds))
                .append($('<div class="input-group-btn">').append($remove));

            this.$container.append($item);

            Select.init($type, {});
            Select.init($seconds, {
                sortBy: '$score',
                sortDirection: 'desc',
                /**
                 * @param {string} search
                 * @param {{value: string}} item
                 * @return {number}
                 */
                score: (search, item) => {
                    let num = parseInt(item.value);
                    let searchNum = parseInt(search);

                    if (isNaN(searchNum)) {
                        return 0;
                    }

                    let numOpposite = Number.MAX_SAFE_INTEGER - num;

                    if (searchNum === 0 && num === 0) {
                        return numOpposite;
                    }

                    if (searchNum * 60 === num) {
                        return numOpposite;
                    }

                    if (searchNum * 60 * 60 === num) {
                        return numOpposite;
                    }

                    if (searchNum * 60 * 60 * 24 === num) {
                        return numOpposite;
                    }

                    return 0;
                },
                load: (item, callback) => {
                    let num = parseInt(item);

                    if (isNaN(num) || num < 0) {
                        return;
                    }

                    if (num > 59) {
                        return;
                    }

                    let list = [];

                    let mSeconds = num * 60;

                    if (!this.isBefore(mSeconds, limitDate)) {
                        return;
                    }

                    list.push({
                        value: mSeconds.toString(),
                        text: this.stringifySeconds(mSeconds),
                    });

                    if (num <= 24) {
                        let hSeconds = num * 3600;

                        if (this.isBefore(hSeconds, limitDate)) {
                            list.push({
                                value: hSeconds.toString(),
                                text: this.stringifySeconds(hSeconds),
                            });
                        }
                    }

                    if (num <= 30) {
                        let dSeconds = num * 3600 * 24;

                        if (this.isBefore(dSeconds, limitDate)) {
                            list.push({
                                value: dSeconds.toString(),
                                text: this.stringifySeconds(dSeconds),
                            });
                        }
                    }

                    callback(list);
                }
            });
        },

        isBefore: function (seconds, limitDate) {
            return moment.utc().add(seconds, 'seconds').isBefore(limitDate);
        },

        stringifySeconds: function (totalSeconds) {
            if (!totalSeconds) {
                return this.translate('on time', 'labels', 'Meeting');
            }

            let d = totalSeconds;
            let days = Math.floor(d / 86400);
            d = d % 86400;
            let hours = Math.floor(d / 3600);
            d = d % 3600;
            let minutes = Math.floor(d / 60);
            let seconds = d % 60;

            let parts = [];

            if (days) {
                parts.push(days + '' + this.getLanguage().translate('d', 'durationUnits'));
            }

            if (hours) {
                parts.push(hours + '' + this.getLanguage().translate('h', 'durationUnits'));
            }

            if (minutes) {
                parts.push(minutes + '' + this.getLanguage().translate('m', 'durationUnits'));
            }

            if (seconds) {
                parts.push(seconds + '' + this.getLanguage().translate('s', 'durationUnits'));
            }

            return parts.join(' ') + ' ' + this.translate('before', 'labels', 'Meeting');
        },

        convertSeconds: function (seconds) {
            return seconds;
        },

        getDetailItemHtml: function (item) {
            return $('<div>')
                .append(
                    $('<span>').text(this.getLanguage().translateOption(item.type, 'reminderTypes')),
                    ' ',
                    $('<span>').text(this.stringifySeconds(item.seconds))
                )
                .get(0).outerHTML;
        },

        getValueForDisplay: function () {
            if (this.isDetailMode() || this.isListMode()) {
                let html = '';

                this.reminderList.forEach(item => {
                    html += this.getDetailItemHtml(item);
                });

                return html;
            }
        },

        fetch: function () {
            let data = {};

            data[this.name] = Espo.Utils.cloneDeep(this.reminderList);

            return data;
        },
    });
});

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

define('crm:views/meeting/fields/date-start', ['views/fields/datetime-optional'], function (Dep) {

    return Dep.extend({

        emptyTimeInInlineEditDisabled: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.noneOption = this.translate('All-Day', 'labels', 'Meeting');
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            if (data[this.nameDate]) {
                data.isAllDay = true;
            } else {
                data.isAllDay = false;
            }

            return data;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode()) {
                this.controlTimePartVisibility();
            }
        },

        controlTimePartVisibility: function () {
            if (!this.isEditMode()) {
                return;
            }

            if (this.isInlineEditMode()) {
                if (this.model.get('isAllDay')) {
                    this.$time.addClass('hidden');
                    this.$el.find('.time-picker-btn').addClass('hidden');
                } else {
                    this.$time.removeClass('hidden');
                    this.$el.find('.time-picker-btn').removeClass('hidden');
                }
            }
        },
    });
});

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

define('crm:views/meeting/fields/date-end', ['views/fields/datetime-optional'], function (Dep) {

    return Dep.extend({

        validateAfterAllowSameDay: true,
        emptyTimeInInlineEditDisabled: true,
        noneOptionIsHidden: true,
        isEnd: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.isAllDayValue = this.model.get('isAllDay');

            this.listenTo(this.model, 'change:isAllDay', (model, value, o) => {
                if (!o.ui) {
                    return;
                }

                if (!this.isEditMode()) {
                    return;
                }

                if (this.isAllDayValue === undefined && !value) {
                    this.isAllDayValue = value;

                    return;
                }

                this.isAllDayValue = value;

                if (value) {
                    this.$time.val(this.noneOption);
                } else {
                    let dateTime = this.model.get('dateStart');

                    if (!dateTime) {
                        dateTime = this.getDateTime().getNow(5);
                    }

                    let m = this.getDateTime().toMoment(dateTime);
                    dateTime = m.format(this.getDateTime().getDateTimeFormat());

                    let index = dateTime.indexOf(' ');
                    let time = dateTime.substring(index + 1);

                    if (this.model.get('dateEnd')) {
                        this.$time.val(time);
                    }
                }

                this.trigger('change');
                this.controlTimePartVisibility();
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode()) {
                this.controlTimePartVisibility();
            }
        },

        controlTimePartVisibility: function () {
            if (!this.isEditMode()) {
                return;
            }

            if (this.model.get('isAllDay')) {
                this.$time.addClass('hidden');
                this.$el.find('.time-picker-btn').addClass('hidden');

                return;
            }

            this.$time.removeClass('hidden');
            this.$el.find('.time-picker-btn').removeClass('hidden');
        },
    });
});

define("modules/crm/views/meeting/fields/acceptance-status", ["exports", "views/fields/enum"], function (_exports, _enum) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _enum = _interopRequireDefault(_enum);
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

  class _default extends _enum.default {
    searchTypeList = ['anyOf', 'noneOf'];
    fetchSearch() {
      let data = super.fetchSearch();
      if (data && data.data.type === 'noneOf' && data.value && data.value.length > 1) {
        data.value = [data.value[0]];
      }
      return data;
    }
  }
  _exports.default = _default;
});

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

define('crm:views/mass-email/detail', ['views/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            if (~['Draft', 'Pending'].indexOf(this.model.get('status'))) {
                if (this.getAcl().checkModel(this.model, 'edit')) {
                    this.menu.buttons.push({
                        'label': 'Send Test',
                        'action': 'sendTest',
                        'acl': 'edit'
                    });
                }
            }
        },

        actionSendTest: function () {
            this.createView('sendTest', 'crm:views/mass-email/modals/send-test', {
                model: this.model
            }, function (view) {
                view.render();
            }, this);
        },
    });
});

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

define('crm:views/mass-email/record/list-for-campaign', ['views/record/list'], function (Dep) {

    return Dep.extend({

        actionSendTest: function (data) {
            var id = data.id;

            var model = this.collection.get(id);

            if (!model) {
                return;
            }

            this.createView('sendTest', 'crm:views/mass-email/modals/send-test', {
                model: model,
            }, (view) => {
                view.render();
            });
        },
    });
});

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

define('crm:views/mass-email/record/edit-small',
['views/record/edit-small', 'crm:views/mass-email/record/edit'], function (Dep, Edit) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            Edit.prototype.initFieldsControl.call(this);
        },
    });
});

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

define('crm:views/mass-email/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        bottomView: 'crm:views/mass-email/record/detail-bottom',
    });
});


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

define('crm:views/mass-email/record/detail-bottom', ['views/record/detail-bottom'], function (Dep) {

    return Dep.extend({

        setupPanels: function () {
            Dep.prototype.setupPanels.call(this);

            this.panelList.unshift({
                name: 'queueItems',
                label: this.translate('queueItems', 'links', 'MassEmail'),
                view: 'views/record/panels/relationship',
                select: false,
                create: false,
                layout: 'listForMassEmail',
                rowActionsView: 'views/record/row-actions/empty',
                filterList: ['all', 'pending', 'sent', 'failed'],
            });
        },

        afterRender: function () {
            Dep.prototype.setupPanels.call(this);
        },
    });
});

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

define('crm:views/mass-email/record/row-actions/for-campaign',
['views/record/row-actions/relationship-no-unlink'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit && !~['Complete'].indexOf(this.model.get('status'))) {
                actionList.unshift({
                    action: 'sendTest',
                    label: 'Send Test',
                    data: {
                        id: this.model.id,
                    }
                });
            }

            return actionList;
        }
    });
});

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

define('crm:views/mass-email/modals/send-test', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        scope: 'MassEmail',

        template: 'crm:mass-email/modals/send-test',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.headerText = this.translate('Send Test', 'labels', 'MassEmail');

            var model = new Model();

            model.set('usersIds', [this.getUser().id]);

            var usersNames = {};

            usersNames[this.getUser().id] = this.getUser().get('name');
            model.set('usersNames', usersNames);

            this.createView('users', 'views/fields/link-multiple', {
                model: model,
                selector: '.field[data-name="users"]',
                foreignScope: 'User',
                defs: {
                    name: 'users',
                    params: {
                    }
                },
                mode: 'edit',
            });

            this.createView('contacts', 'views/fields/link-multiple', {
                model: model,
                selector: '.field[data-name="contacts"]',
                foreignScope: 'Contact',
                defs: {
                    name: 'contacts',
                    params: {
                    }
                },
                mode: 'edit',
            });

            this.createView('leads', 'views/fields/link-multiple', {
                model: model,
                selector: '.field[data-name="leads"]',
                foreignScope: 'Lead',
                defs: {
                    name: 'leads',
                    params: {
                    }
                },
                mode: 'edit',
            });

            this.createView('accounts', 'views/fields/link-multiple', {
                model: model,
                selector: '.field[data-name="accounts"]',
                foreignScope: 'Account',
                defs: {
                    name: 'accounts',
                    params: {
                    }
                },
                mode: 'edit',
            });

            this.buttonList.push({
                name: 'sendTest',
                label: 'Send Test',
                style: 'danger',
            });

            this.buttonList.push({
                name: 'cancel',
                label: 'Cancel',
            });
        },

        actionSendTest: function () {

            var list = [];

            this.getView('users').fetch().usersIds.forEach(function (id) {
                list.push({
                    id: id,
                    type: 'User'
                });
            });

            this.getView('contacts').fetch().contactsIds.forEach(function (id) {
                list.push({
                    id: id,
                    type: 'Contact'
                });
            });

            this.getView('leads').fetch().leadsIds.forEach(function (id) {
                list.push({
                    id: id,
                    type: 'Lead'
                });
            });

            this.getView('accounts').fetch().accountsIds.forEach(function (id) {
                list.push({
                    id: id,
                    type: 'Account'
                });
            });

            if (list.length === 0) {
                alert(this.translate('selectAtLeastOneTarget', 'messages', 'MassEmail'));

                return;
            }

            this.disableButton('sendTest');

            Espo.Ajax
                .postRequest('MassEmail/action/sendTest', {
                    id: this.model.id,
                    targetList: list,
                })
                .then(() => {
                    Espo.Ui.success(this.translate('testSent', 'messages', 'MassEmail'));
                    this.close();
                })
                .catch(() => {
                    this.enableButton('sendTest');
                });
        },
    });
});

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

define('crm:views/mass-email/fields/smtp-account', ['views/lead-capture/fields/smtp-account'], function (Dep) {

    return Dep.extend({

        dataUrl: 'MassEmail/action/smtpAccountDataList',
    });
});

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

define('crm:views/mass-email/fields/from-address', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.model.isNew() && !this.model.has('fromAddress')) {
                this.model.set('fromAddress', this.getConfig().get('outboundEmailFromAddress'));
            }

            if (this.model.isNew() && !this.model.has('fromName')) {
                this.model.set('fromName', this.getConfig().get('outboundEmailFromName'));
            }
        },
    });
});

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

define('crm:views/mass-email/fields/email-template', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        getCreateAttributes: function () {
            return {
                oneOff: true
            }
        },
    });
});

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

define('crm:views/lead/detail', ['views/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.addMenuItem('buttons', {
                name: 'convert',
                action: 'convert',
                label: 'Convert',
                acl: 'edit',
                hidden: !this.isConvertable(),
                onClick: () => this.actionConvert(),
            });

            if (!this.model.has('status')) {
                this.listenToOnce(this.model, 'sync', () => {
                    if (this.isConvertable()) {
                        this.showHeaderActionItem('convert');
                    }
                });
            }
        },

        isConvertable: function () {
            return !['Converted', 'Dead'].includes(this.model.get('status')) ||
                !this.model.has('status');
        },

        actionConvert: function () {
            this.getRouter().navigate(this.model.entityType + '/convert/' + this.model.id , {trigger: true});
        },
    });
});

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

define('crm:views/lead/convert', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:lead/convert',

        data: function () {
            return {
                scopeList: this.scopeList,
                scope: this.model.entityType,
            };
        },

        events: {
            'change input.check-scope': function (e) {
                var scope = $(e.currentTarget).data('scope');
                var $div = this.$el.find('.edit-container-' + Espo.Utils.toDom(scope));

                if (e.currentTarget.checked)    {
                    $div.removeClass('hide');
                } else {
                    $div.addClass('hide');
                }
            },
            'click button[data-action="convert"]': function (e) {
                this.convert();
            },
            'click button[data-action="cancel"]': function (e) {
                this.getRouter().navigate('#Lead/view/' + this.id, {trigger: true});
            },
        },

        setup: function () {
            this.wait(true);
            this.id = this.options.id;

            Espo.Ui.notify(' ... ');

            this.getModelFactory().create('Lead', (model) => {
                this.model = model;
                model.id = this.id;

                this.listenToOnce(model, 'sync', () => {
                    this.build();
                });

                model.fetch();
            });
        },

        build: function () {
            var scopeList = this.scopeList = [];

            (this.getMetadata().get('entityDefs.Lead.convertEntityList') || []).forEach(scope => {
                if (scope === 'Account' && this.getConfig().get('b2cMode')) {
                    return;
                }

                if (this.getMetadata().get(['scopes', scope, 'disabled'])) {
                    return
                }

                if (this.getAcl().check(scope, 'edit')) {
                    scopeList.push(scope);
                }
            });

            let i = 0;

            let ignoreAttributeList = [
                'createdAt',
                'modifiedAt',
                'modifiedById',
                'modifiedByName',
                'createdById',
                'createdByName',
            ];

            if (scopeList.length) {
                Espo.Ajax.postRequest('Lead/action/getConvertAttributes', {id: this.model.id})
                    .then(data => {
                        scopeList.forEach(scope => {
                            this.getModelFactory().create(scope, model => {
                                model.populateDefaults();

                                model.set(data[scope] || {}, {silent: true});

                                let convertEntityViewName = this.getMetadata()
                                    .get(['clientDefs', scope, 'recordViews', 'edit']) || 'views/record/edit';

                                this.createView(scope, convertEntityViewName, {
                                    model: model,
                                    fullSelector: '#main .edit-container-' + Espo.Utils.toDom(scope),
                                    buttonsPosition: false,
                                    buttonsDisabled: true,
                                    layoutName: 'detailConvert',
                                    exit: () => {},
                                }, view => {
                                    i++;

                                    if (i === scopeList.length) {
                                        this.wait(false);
                                        Espo.Ui.notify(false);
                                    }
                                });
                            });
                        });
                    });
            }

            if (scopeList.length === 0) {
                this.wait(false);
            }
        },

        convert: function () {
            let scopeList = [];

            this.scopeList.forEach(scope => {
                var el = this.$el.find('input[data-scope="' + scope + '"]').get(0);

                if (el && el.checked) {
                    scopeList.push(scope);
                }
            });

            if (scopeList.length === 0) {
                this.notify('Select one or more checkboxes', 'error');

                return;
            }

            this.getRouter().confirmLeaveOut = false;

            let notValid = false;

            scopeList.forEach(scope => {
                let editView = this.getView(scope);

                editView.model.set(editView.fetch());
                notValid = editView.validate() || notValid;
            });

            let data = {
                id: this.model.id,
                records: {},
            };

            scopeList.forEach(scope => {
                data.records[scope] = this.getView(scope).model.attributes;
            });

            var process = (data) => {
                this.$el.find('[data-action="convert"]').addClass('disabled');

                Espo.Ui.notify(' ... ');

                Espo.Ajax
                .postRequest('Lead/action/convert', data)
                .then(() => {
                    this.getRouter().confirmLeaveOut = false;
                    this.getRouter().navigate('#Lead/view/' + this.model.id, {trigger: true});

                    this.notify('Converted', 'success');
                })
                .catch(xhr => {
                    Espo.Ui.notify(false);

                    this.$el.find('[data-action="convert"]').removeClass('disabled');

                    if (xhr.status !== 409) {
                        return;
                    }

                    if (xhr.getResponseHeader('X-Status-Reason') !== 'duplicate') {
                        return;
                    }

                    let response = null;

                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        console.error('Could not parse response header.');

                        return;
                    }

                    xhr.errorIsHandled = true;

                    this.createView('duplicate', 'views/modals/duplicate', {duplicates: response}, view => {
                        view.render();

                        this.listenToOnce(view, 'save', () => {
                            data.skipDuplicateCheck = true;

                            process(data);
                        });
                    });
                });
            };

            if (notValid) {
                this.notify('Not Valid', 'error');

                return;
            }

            process(data);
        },
    });
});

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

define('crm:views/lead/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        selfAssignAction: true,
        sideView: 'crm:views/lead/record/detail-side',

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        getSelfAssignAttributes: function () {
            if (this.model.get('status') === 'New') {
                if (
                    ~(this.getMetadata().get(['entityDefs', 'Lead', 'fields', 'status', 'options']) || [])
                        .indexOf('Assigned')
                ) {
                    return {
                        'status': 'Assigned',
                    };
                }
            }
        },
    });
});

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

define('crm:views/lead/record/detail-side', ['views/record/detail-side'], function (Dep) {

    return Dep.extend({

        setupPanels: function () {},
    });
});


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

define('crm:views/lead/record/panels/converted-to', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

        setupFields: function () {
            this.fieldList = [];

            if (this.getAcl().check('Account') && !this.getMetadata().get('scopes.Account.disabled')) {
                this.fieldList.push('createdAccount');
            }

            if (this.getAcl().check('Contact') && !this.getMetadata().get('scopes.Contact.disabled')) {
                this.fieldList.push('createdContact');
            }

            if (this.getAcl().check('Opportunity') && !this.getMetadata().get('scopes.Opportunity.disabled')) {
                this.fieldList.push('createdOpportunity');
            }
        },
    });
});

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

define('crm:views/lead/fields/industry', ['views/fields/enum'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/lead/fields/created-opportunity', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        getSelectFilters: function () {
            if (this.model.get('createdAccountId')) {
                return {
                    'account': {
                        type: 'equals',
                        attribute: 'accountId',
                        value: this.model.get('createdAccountId'),
                        data: {
                            type: 'is',
                            nameValue: this.model.get('createdAccountName'),
                        },
                    }
                };
            }
        },
    });
});

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

define('crm:views/lead/fields/created-contact', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        getSelectFilters: function () {
            if (this.model.get('createdAccountId')) {
                return {
                    'account': {
                        type: 'equals',
                        attribute: 'accountId',
                        value: this.model.get('createdAccountId'),
                        data: {
                            type: 'is',
                            nameValue: this.model.get('createdAccountName')
                        }
                    }
                };
            }
        },
    });
});

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

define('crm:views/lead/fields/acceptance-status', ['views/fields/enum-column'], function (Dep) {

    return Dep.extend({

        searchTypeList: ['anyOf', 'noneOf'],

        setup: function () {
            this.params.options = this.getMetadata().get('entityDefs.Meeting.fields.acceptanceStatus.options');
            this.params.translation = 'Meeting.options.acceptanceStatus';

            Dep.prototype.setup.call(this);
        },
    });
});

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

define('crm:views/knowledge-base-article/list', ['views/list-with-categories'], function (Dep) {

    return Dep.extend({

        categoryScope: 'KnowledgeBaseCategory',
        categoryField: 'categories',
        categoryFilterType: 'inCategory',
    });
});

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

define('crm:views/knowledge-base-article/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({});
});

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

define('crm:views/knowledge-base-article/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

    });
});

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

define('crm:views/knowledge-base-article/record/edit-quick', ['views/record/edit-small'], function (Dep) {

    return Dep.extend({

    	isWide: true,
        sideView: false,
    });
});

define("modules/crm/views/knowledge-base-article/record/detail", ["exports", "modules/crm/knowledge-base-helper", "views/record/detail"], function (_exports, _knowledgeBaseHelper, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _knowledgeBaseHelper = _interopRequireDefault(_knowledgeBaseHelper);
  _detail = _interopRequireDefault(_detail);
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
  /**
   * @class
   * @name Class
   * @extends Dep
   */
  var _default = _detail.default.extend( /** @lends Class# */{
    saveAndContinueEditingAction: true,
    setup: function () {
      _detail.default.prototype.setup.call(this);
      if (this.getUser().isPortal()) {
        this.sideDisabled = true;
      }
      if (this.getAcl().checkScope('Email', 'create')) {
        this.dropdownItemList.push({
          'label': 'Send in Email',
          'name': 'sendInEmail'
        });
      }
      if (this.getUser().isPortal()) {
        if (!this.getAcl().checkScope(this.scope, 'edit')) {
          if (!this.model.getLinkMultipleIdList('attachments').length) {
            this.hideField('attachments');
            this.listenToOnce(this.model, 'sync', () => {
              if (this.model.getLinkMultipleIdList('attachments').length) {
                this.showField('attachments');
              }
            });
          }
        }
      }
    },
    actionSendInEmail: function () {
      Espo.Ui.notify(this.translate('pleaseWait', 'messages'));
      let helper = new _knowledgeBaseHelper.default(this.getLanguage());
      helper.getAttributesForEmail(this.model, {}, attributes => {
        let viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
        this.createView('composeEmail', viewName, {
          attributes: attributes,
          selectTemplateDisabled: true,
          signatureDisabled: true
        }, view => {
          Espo.Ui.notify(false);
          view.render();
        });
      });
    },
    afterRender: function () {
      _detail.default.prototype.afterRender.call(this);
      if (this.getUser().isPortal()) {
        this.$el.find('.field[data-name="body"]').css('minHeight', '400px');
      }
    }
  });
  _exports.default = _default;
});

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

define('crm:views/knowledge-base-article/record/detail-quick', ['views/record/detail-small'], function (Dep) {

    return Dep.extend({

    	isWide: true,
        sideView: false,
    });
});


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

define('crm:views/knowledge-base-article/modals/select-records',
['crm:views/document/modals/select-records'], function (Dep) {

    return Dep.extend({

        categoryScope: 'KnowledgeBaseCategory',
        categoryField: 'categories',
        categoryFilterType: 'inCategory',
    });
});

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

define('crm:views/knowledge-base-article/fields/status', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            var publishDateWasSet = false;

            this.on('change', () => {
                if (this.model.get('status') === 'Published') {
                    if (!this.model.get('publishDate')) {
                        publishDateWasSet = true;

                        this.model.set('publishDate', this.getDateTime().getToday());
                    }
                } else {
                    if (publishDateWasSet) {
                        this.model.set('publishDate', null);
                    }
                }
            });
        },
    });
});

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

define('crm:views/knowledge-base-article/fields/language', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getMetadata().get(['app', 'language', 'list']) || []);
            this.params.options.unshift('');
            this.translatedOptions = Espo.Utils.clone(this.getLanguage().translate('language', 'options') || {});
            this.translatedOptions[''] = this.translate('Any', 'labels', 'KnowledgeBaseArticle')
        },
    });
});

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

define('crm:views/fields/ico', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        // language=Handlebars
        templateContent: `{{! ~}}
            <span
                class="{{iconClass}} text-muted action icon"
                style="cursor: pointer"
                title="{{viewLabel}}"
                data-action="quickView"
                data-id="{{id}}"
                {{#if notRelationship}}data-scope="{{scope}}"{{/if}}
            ></span>
        {{~!}}`,

        data: function () {
            return {
                notRelationship: this.params.notRelationship,
                viewLabel: this.translate('View'),
                id: this.model.id,
                scope: this.model.entityType,
                iconClass: this.getMetadata().get(['clientDefs', this.model.entityType, 'iconClass']) ||
                    'far fa-calendar-times',
            };
        },
    });
});

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

define('crm:views/event-confirmation/confirmation', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:event-confirmation/confirmation',

        data: function () {
            let style = this.actionData.style || 'default';

            return {
                actionData: this.actionData,
                style: style,
                dateStart: this.actionData.dateStart ?
                    this.convertDateTime(this.actionData.dateStart) : null,
                sentDateStart: this.actionData.sentDateStart ?
                    this.convertDateTime(this.actionData.sentDateStart) : null,
                dateStartChanged: this.actionData.sentDateStart &&
                    this.actionData.dateStart !== this.actionData.sentDateStart,
                actionDataList: this.getActionDataList(),
            };
        },

        setup: function () {
            this.actionData = this.options.actionData;
        },

        getActionDataList: function () {
            let actionMap = {
                'Accepted': 'accept',
                'Declined': 'decline',
                'Tentative': 'tentative',
            };

            let statusList = ['Accepted', 'Tentative', 'Declined'];

            if (!statusList.includes(this.actionData.status)) {
                return null;
            }

            let url = window.location.href.replace('action=' + actionMap[this.actionData.status], 'action={action}');

            return statusList.map(item => {
                let active = item === this.actionData.status;

                return {
                    active: active,
                    link: active ? '' : url.replace('{action}', actionMap[item]),
                    label: this.actionData.statusTranslation[item],
                };
            });
        },

        convertDateTime: function (value) {
            let timezone = this.getConfig().get('timeZone');

            let m = this.getDateTime().toMoment(value)
                .tz(timezone);

            return m.format(this.getDateTime().getDateTimeFormat()) + ' ' +
                m.format('Z z');
        },
    });
});

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

define('crm:views/email-queue-item/list', ['views/list'], function (Dep) {

    return Dep.extend({

        createButton: false,
    });
});

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

define('crm:views/email-queue-item/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        rowActionsView: 'views/record/row-actions/remove-only',
    });
});

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

define('crm:views/document/list', ['views/list-with-categories'], function (Dep) {

    return Dep.extend({

        quickCreate: true,

        currentCategoryId: null,
        currentCategoryName: '',

        categoryScope: 'DocumentFolder',
        categoryField: 'folder',
        categoryFilterType: 'inCategory',
    });
});

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

define('crm:views/document/fields/name', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.model.isNew()) {
                this.listenTo(this.model, 'change:fileName', () => {
                    this.model.set('name', this.model.get('fileName'));
                });
            }
        },
    });
});

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

define('crm:views/document/fields/file', ['views/fields/file'], function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            if (this.isListMode()) {
                let name = this.model.get(this.nameName);
                let id = this.model.get(this.idName);

                if (!id) {
                    return '';
                }

                return $('<a>')
                    .attr('title', name)
                    .attr('href', this.getBasePath() + '?entryPoint=download&id=' + id)
                    .attr('target', '_BLANK')
                    .append(
                        $('<span>').addClass('fas fa-paperclip small')
                    )
                    .get(0).outerHTML;
            }

            return Dep.prototype.getValueForDisplay.call(this);
        },
    });
});

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

define('crm:views/dashlets/tasks', ['views/dashlets/abstract/record-list'], function (Dep) {

    return Dep.extend({

        listView: 'crm:views/task/record/list-expanded',
        rowActionsView: 'crm:views/task/record/row-actions/dashlet',
    });
});


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

define('crm:views/dashlets/meetings', ['views/dashlets/abstract/record-list'], function (Dep) {

    return Dep.extend({

        name: 'Meetings',
        scope: 'Meeting',
        listView: 'crm:views/meeting/record/list-expanded',
        rowActionsView: 'crm:views/meeting/record/row-actions/dashlet',
    });
});

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

define('crm:views/dashlets/calls', ['views/dashlets/abstract/record-list'], function (Dep) {

    return Dep.extend({

        name: 'Calls',
        scope: 'Call',
        listView: 'crm:views/call/record/list-expanded',
        rowActionsView: 'crm:views/call/record/row-actions/dashlet',
    });
});


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

define('crm:views/dashlets/calendar', ['views/dashlets/abstract/base'], function (Dep) {

    return Dep.extend({

        name: 'Calendar',

        noPadding: true,

        templateContent: '<div class="calendar-container">{{{calendar}}} </div>',

        init: function () {
            Dep.prototype.init.call(this);
        },

        afterRender: function () {
            var mode = this.getOption('mode');

            if (mode === 'timeline') {
                var userList = [];
                var userIdList = this.getOption('usersIds') || [];
                var userNames = this.getOption('usersNames') || {};

                userIdList.forEach(id => {
                    userList.push({
                        id: id,
                        name: userNames[id] || id,
                    });
                });

                let viewName = this.getMetadata().get(['clientDefs', 'Calendar', 'timelineView']) ||
                    'crm:views/calendar/timeline';

                this.createView('calendar', viewName, {
                    selector: '> .calendar-container',
                    header: false,
                    calendarType: 'shared',
                    userList: userList,
                    enabledScopeList: this.getOption('enabledScopeList'),
                    noFetchLoadingMessage: true,
                }, (view) => {
                    view.render();
                });

                return;
            }

            var teamIdList = null;

            if (~['basicWeek', 'month', 'basicDay'].indexOf(mode)) {
                teamIdList = this.getOption('teamsIds');
            }

            let viewName = this.getMetadata().get(['clientDefs', 'Calendar', 'calendarView']) ||
                'crm:views/calendar/calendar';

            this.createView('calendar', viewName, {
                mode: mode,
                selector: '> .calendar-container',
                header: false,
                enabledScopeList: this.getOption('enabledScopeList'),
                containerSelector: this.getSelector(),
                teamIdList: teamIdList,
            }, view => {
                this.listenTo(view, 'view', () => {
                    if (this.getOption('mode') === 'month') {
                        let title = this.getOption('title');

                        let $container = $('<span>')
                            .append(
                                $('<span>').text(title),
                                ' <span class="chevron-right"></span> ',
                                $('<span>').text(view.getTitle())
                            );

                        let $headerSpan = this.$el.closest('.panel').find('.panel-heading > .panel-title > span');

                        $headerSpan.html($container.get(0).innerHTML);
                    }
                });

                view.render();

                this.on('resize', () => {
                    setTimeout(() => view.adjustSize(), 50);
                });
            });
        },

        setupActionList: function () {
            this.actionList.unshift({
                name: 'viewCalendar',
                text: this.translate('View Calendar', 'labels', 'Calendar'),
                url: '#Calendar',
                iconHtml: '<span class="far fa-calendar-alt"></span>',
                onClick: () => this.actionViewCalendar(),
            });
        },

        setupButtonList: function () {
            if (this.getOption('mode') !== 'timeline') {
                this.buttonList.push({
                    name: 'previous',
                    html: '<span class="fas fa-chevron-left"></span>',
                    onClick: () => this.actionPrevious(),
                });

                this.buttonList.push({
                    name: 'next',
                    html: '<span class="fas fa-chevron-right"></span>',
                    onClick: () => this.actionNext(),
                });
            }
        },

        actionRefresh: function () {
            var view = this.getView('calendar');

            if (!view) {
                return;
            }

            view.actionRefresh();
        },

        actionNext: function () {
            var view = this.getView('calendar');

            if (!view) {
                return;
            }

            view.actionNext();
        },

        actionPrevious: function () {
            var view = this.getView('calendar');

            if (!view) {
                return;
            }

            view.actionPrevious();
        },

        actionViewCalendar: function () {
            this.getRouter().navigate('#Calendar', {trigger: true});
        },
    });
});

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

define('crm:views/dashlets/activities',
['views/dashlets/abstract/base', 'multi-collection'], function (Dep, MultiCollection) {

    return Dep.extend({

        name: 'Activities',

        // language=Handlebars
        templateContent: '<div class="list-container">{{{list}}}</div>',

        rowActionsView: 'crm:views/record/row-actions/activities-dashlet',

        defaultListLayout: {
            rows: [
                [
                    {
                        name: 'ico',
                        view: 'crm:views/fields/ico',
                        params: {
                            notRelationship: true,
                        },
                    },
                    {
                        name: 'name',
                        link: true,
                    },
                ],
                [
                    {name: 'dateStart'},
                ],
            ],
        },

        listLayoutEntityTypeMap: {
            Task: {
                rows: [
                    [
                        {
                            name: 'ico',
                            view: 'crm:views/fields/ico',
                            params: {
                                notRelationship: true
                            },
                        },
                        {
                            name: 'name',
                            link: true,
                        },
                    ],
                    [
                        {name: 'dateEnd'},
                        {
                            name: 'priority',
                            view: 'crm:views/task/fields/priority-for-dashlet',
                        },
                    ],
                ]
            }
        },

        init: function () {
            Dep.prototype.init.call(this);
        },

        setup: function () {
            this.seeds = {};

            this.scopeList = this.getOption('enabledScopeList') || [];

            this.listLayout = {};

            this.scopeList.forEach((item) => {
                if (item in this.listLayoutEntityTypeMap) {
                    this.listLayout[item] = this.listLayoutEntityTypeMap[item];

                    return;
                }

                this.listLayout[item] = this.defaultListLayout;
            });

            this.wait(true);
            var i = 0;

            this.scopeList.forEach(scope => {
                this.getModelFactory().create(scope, seed => {
                    this.seeds[scope] = seed;

                    i++;

                    if (i === this.scopeList.length) {
                        this.wait(false);
                    }
                });
            });

            this.scopeList.slice(0).reverse().forEach(scope => {
                if (this.getAcl().checkScope(scope, 'create')) {
                    this.actionList.unshift({
                        name: 'createActivity',
                        text: this.translate('Create ' + scope, 'labels', scope),
                        iconHtml: '<span class="fas fa-plus"></span>',
                        url: '#' + scope + '/create',
                        data: {
                            scope: scope,
                        },
                    });
                }
            });
        },

        afterRender: function () {
            this.collection = new MultiCollection();
            this.collection.seeds = this.seeds;
            this.collection.url = 'Activities/upcoming';
            this.collection.maxSize = this.getOption('displayRecords') ||
                this.getConfig().get('recordsPerPageSmall') || 5;
            this.collection.data.entityTypeList = this.scopeList;
            this.collection.data.futureDays = this.getOption('futureDays');

            this.listenToOnce(this.collection, 'sync', () => {
                this.createView('list', 'crm:views/record/list-activities-dashlet', {
                    selector: '> .list-container',
                    pagination: false,
                    type: 'list',
                    rowActionsView: this.rowActionsView,
                    checkboxes: false,
                    collection: this.collection,
                    listLayout: this.listLayout,
                }, view => {
                    view.render();
                });
            });

            this.collection.fetch();
        },

        actionRefresh: function () {
            this.collection.fetch({
                previousDataList: this.collection.models.map(model => {
                    return Espo.Utils.cloneDeep(model.attributes);
                }),
            });
        },

        actionCreateActivity: function (data) {
            var scope = data.scope;
            var attributes = {};

            this.populateAttributesAssignedUser(scope, attributes);

            Espo.Ui.notify(' ... ');

            var viewName = this.getMetadata().get('clientDefs.'+scope+'.modalViews.edit') || 'views/modals/edit';

            this.createView('quickCreate', viewName, {
                scope: scope,
                attributes: attributes,
            }, view => {
                view.render();
                view.notify(false);

                this.listenToOnce(view, 'after:save', () => {
                    this.actionRefresh();
                });
            });
        },

        actionCreateMeeting: function () {
            var attributes = {};

            this.populateAttributesAssignedUser('Meeting', attributes);

            Espo.Ui.notify(' ... ');

            var viewName = this.getMetadata().get('clientDefs.Meeting.modalViews.edit') || 'views/modals/edit';

            this.createView('quickCreate', viewName, {
                scope: 'Meeting',
                attributes: attributes,
            }, view => {
                view.render();
                view.notify(false);

                this.listenToOnce(view, 'after:save', () => {
                    this.actionRefresh();
                });
            });
        },

        actionCreateCall: function () {
            var attributes = {};

            this.populateAttributesAssignedUser('Call', attributes);

            Espo.Ui.notify(' ... ');

            var viewName = this.getMetadata().get('clientDefs.Call.modalViews.edit') || 'views/modals/edit';

            this.createView('quickCreate', viewName, {
                scope: 'Call',
                attributes: attributes,
            }, view => {
                view.render();
                view.notify(false);

                this.listenToOnce(view, 'after:save', () => {
                    this.actionRefresh();
                });
            });
        },

        populateAttributesAssignedUser: function (scope, attributes) {
            if (this.getMetadata().get(['entityDefs', scope, 'fields', 'assignedUsers'])) {
                attributes['assignedUsersIds'] = [this.getUser().id];
                attributes['assignedUsersNames'] = {};
                attributes['assignedUsersNames'][this.getUser().id] = this.getUser().get('name');
            } else {
                attributes['assignedUserId'] = this.getUser().id;
                attributes['assignedUserName'] = this.getUser().get('name');
            }
        },
    });
});

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

define('crm:views/dashlets/options/sales-pipeline', ['crm:views/dashlets/options/chart'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.getAcl().getLevel('Opportunity', 'read') === 'own') {
                this.hideField('team');
            }
        },
    });
});

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

define('crm:views/dashlets/options/calendar', ['views/dashlets/options/base'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.manageFields();
            this.listenTo(this.model, 'change:mode', this.manageFields, this);
        },


        init: function () {
            Dep.prototype.init.call(this);

            this.fields.enabledScopeList.options = this.getConfig().get('calendarEntityList') || [];
        },

        manageFields: function (model, value, o) {
            if (this.model.get('mode') === 'timeline') {
                this.showField('users');
            } else {
                this.hideField('users');
            }

            if (
                this.getAcl().get('userPermission') !== 'no'
                &&
                ~['basicWeek', 'month', 'basicDay'].indexOf(this.model.get('mode'))
            ) {
                this.showField('teams');
            } else {
                if (o && o.ui) {
                    this.model.set('teamsIds', []);
                }

                this.hideField('teams');
            }
        },
    });
});

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

define('crm:views/dashlets/options/activities', ['views/dashlets/options/base'], function (Dep) {

    return Dep.extend({

        init: function () {
            Dep.prototype.init.call(this);

            var entityTypeList = [];
            var activitiesEntityList = Espo.Utils.clone(this.getConfig().get('activitiesEntityList') || []);

            activitiesEntityList.push('Task');

            activitiesEntityList.forEach(item => {
                if (this.getMetadata().get(['scopes', item, 'disabled'])) {
                    return;
                }

                if (!this.getAcl().checkScope(item)) {
                    return;
                }

                entityTypeList.push(item);
            });

            this.fields.enabledScopeList.options = entityTypeList;
        },
    });
});

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

define('crm:views/dashlets/options/sales-pipeline/fields/team', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        getSelectBoolFilterList: function () {
            if (this.getAcl().getLevel('Opportunity', 'read') === 'team') {
                return ['onlyMy'];
            }
        },
    });

});

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

define('crm:views/contact/detail', ['views/detail'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/contact/record/detail-small', ['views/record/detail-small', 'crm:views/contact/record/detail'], function (Dep, Detail) {

    return Dep.extend({

    });
});

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

define('crm:views/contact/modals/select-for-portal-user', ['views/modals/select-records'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.buttonList.unshift({
                name: 'skip',
                text: this.translate('Proceed w/o Contact', 'labels', 'User')
            });
        },

        actionSkip: function () {
            this.trigger('skip');
            this.remove();
        },
    });
});

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

define('crm:views/contact/fields/title', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(
                this.getMetadata().get('entityDefs.Account.fields.contactRole.options') || []
            );
        },
    });
});

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

define('crm:views/contact/fields/opportunity-role', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        searchTypeList: ['anyOf', 'noneOf'],
    });
});

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

define('crm:views/contact/fields/name-for-account', ['views/fields/person-name'], function (Dep) {

    return Dep.extend({

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === 'listLink') {
                if (this.model.get('accountIsInactive')) {
                    this.$el.find('a').css('text-decoration', 'line-through');
                }
            }
        },

        getAttributeList: function () {
            return ['name', 'accountIsInactive'];
        },
    });
});

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

define('crm:views/contact/fields/accounts', ['views/fields/link-multiple-with-columns'], function (Dep) {

    return Dep.extend({

        getAttributeList: function () {
            var list = Dep.prototype.getAttributeList.call(this);

            list.push('accountId');
            list.push('accountName');
            list.push('title');

            return list;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events['click [data-action="switchPrimary"]'] = e => {
                let $target = $(e.currentTarget);
                let id = $target.data('id');

                if (!$target.hasClass('active')) {
                    this.$el.find('button[data-action="switchPrimary"]')
                        .removeClass('active')
                        .children()
                        .addClass('text-muted');

                    $target.addClass('active')
                        .children()
                        .removeClass('text-muted');

                    this.setPrimaryId(id);
                }
            };

            this.primaryIdFieldName = 'accountId';
            this.primaryNameFieldName = 'accountName';
            this.primaryRoleFieldName = 'title';

            this.primaryId = this.model.get(this.primaryIdFieldName);
            this.primaryName = this.model.get(this.primaryNameFieldName);

            this.listenTo(this.model, 'change:' + this.primaryIdFieldName, () => {
                this.primaryId = this.model.get(this.primaryIdFieldName);
                this.primaryName = this.model.get(this.primaryNameFieldName);
            });

            if (this.isEditMode() || this.isDetailMode()) {
                this.events['click a[data-action="setPrimary"]'] = (e) => {
                    let id = $(e.currentTarget).data('id');

                    this.setPrimaryId(id);
                    this.reRender();
                }
            }
        },

        setPrimaryId: function (id) {
            this.primaryId = id;

            if (id) {
                this.primaryName = this.nameHash[id];
            } else {
                this.primaryName = null;
            }

            this.trigger('change');
        },

        renderLinks: function () {
            if (this.primaryId) {
                this.addLinkHtml(this.primaryId, this.primaryName);
            }

            this.ids.forEach(id => {
                if (id !== this.primaryId) {
                    this.addLinkHtml(id, this.nameHash[id]);
                }
            });
        },

        getValueForDisplay: function () {
            if (this.isDetailMode() || this.isListMode()) {
                let names = [];

                if (this.primaryId) {
                    names.push(this.getDetailLinkHtml(this.primaryId, this.primaryName));
                }

                this.ids.forEach(id => {
                    if (id !== this.primaryId) {
                        names.push(this.getDetailLinkHtml(id));
                    }
                });

                return names.join('');
            }
        },

        getDetailLinkHtml: function (id, name) {
            let html = Dep.prototype.getDetailLinkHtml.call(this, id, name);

            if (this.getColumnValue(id, 'isInactive')) {
                let $el = $(html);

                $el.find('a').css('text-decoration', 'line-through');

                return $el.prop('outerHTML');
            }

            return html;
        },

        afterAddLink: function (id) {
            Dep.prototype.afterAddLink.call(this, id);

            if (this.ids.length === 1) {
                this.primaryId = id;
                this.primaryName = this.nameHash[id];
            }

            this.controlPrimaryAppearance();
        },

        afterDeleteLink: function (id) {
            Dep.prototype.afterDeleteLink.call(this, id);

            if (this.ids.length === 0) {
                this.primaryId = null;
                this.primaryName = null;

                return;
            }

            if (id === this.primaryId) {
                this.primaryId = this.ids[0];
                this.primaryName = this.nameHash[this.primaryId];
            }

            this.controlPrimaryAppearance();
        },

        controlPrimaryAppearance: function () {
            this.$el.find('li.set-primary-list-item').removeClass('hidden');

            if (this.primaryId) {
                this.$el.find('li.set-primary-list-item[data-id="'+this.primaryId+'"]').addClass('hidden');
            }
        },

        addLinkHtml: function (id, name) {
            name = name || id;

            if (this.isSearchMode()) {
                return Dep.prototype.addLinkHtml.call(this, id, name);
            }

            let $el = Dep.prototype.addLinkHtml.call(this, id, name);

            let isPrimary = id === this.primaryId;

            let $a = $('<a>')
                .attr('role', 'button')
                .attr('tabindex', '0')
                .attr('data-action', 'setPrimary')
                .attr('data-id', id)
                .text(this.translate('Set Primary', 'labels', 'Account'));

            let $li = $('<li>')
                .addClass('set-primary-list-item')
                .attr('data-id', id)
                .append($a);

            if (isPrimary || this.ids.length === 1) {
                $li.addClass('hidden');
            }

            $el.find('ul.dropdown-menu').append($li);

            if (this.getColumnValue(id, 'isInactive')) {
                $el.find('div.link-item-name').css('text-decoration', 'line-through');
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        fetch: function () {
            let data = Dep.prototype.fetch.call(this);

            data[this.primaryIdFieldName] = this.primaryId;
            data[this.primaryNameFieldName] = this.primaryName;
            data[this.primaryRoleFieldName] = (this.columns[this.primaryId] || {}).role || null;

            data.accountIsInactive = (this.columns[this.primaryId] || {}).isInactive || false;

            if (!this.primaryId) {
                data[this.primaryRoleFieldName] = null;
                data.accountIsInactive = null;
            }

            return data;
        },
    });
});

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

define('crm:views/contact/fields/account', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        getAttributeList: function () {
            var list = Dep.prototype.getAttributeList.call(this);

            list.push('accountIsInactive');

            return list;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === 'list' || this.mode === 'detail') {
                if (this.model.get('accountIsInactive')) {
                    this.$el.find('a').css('textDecoration', 'line-through');
                }
            }
        },
    });
});

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

define('crm:views/contact/fields/account-role', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'crm:contact/fields/account-role/detail',
        listTemplate: 'crm:contact/fields/account-role/detail',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:title', () => {
                this.model.set('accountRole', this.model.get('title'));
            });
        },

        getAttributeList: function () {
            var list = Dep.prototype.getAttributeList.call(this);

            list.push('title');
            list.push('accountIsInactive');

            return list;
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            if (this.model.has('accountIsInactive')) {
                data.accountIsInactive = this.model.get('accountIsInactive');
            }

            return data;
        }
    });
});

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

define('crm:views/case/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        selfAssignAction: true,

        getSelfAssignAttributes: function () {
            if (this.model.get('status') === 'New') {
                if (~(this.getMetadata().get(['entityDefs', 'Case', 'fields', 'status', 'options']) || [])
                    .indexOf('Assigned')
                ) {
                    return {
                        'status': 'Assigned',
                    };
                }
            }
        },
    });
});

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

define('crm:views/case/record/panels/activities', ['crm:views/record/panels/activities'], function (Dep) {

    return Dep.extend({

        getComposeEmailAttributes: function (scope, data, callback) {
            data = data || {};

            Espo.Ui.notify(' ... ');

            Dep.prototype.getComposeEmailAttributes.call(this, scope, data, attributes => {
                attributes.name = '[#' + this.model.get('number') + '] ' + this.model.get('name');

                Espo.Ajax.getRequest('Case/action/emailAddressList?id=' + this.model.id).then(list =>{
                    attributes.to = '';
                    attributes.cc = '';
                    attributes.nameHash = {};

                    list.forEach((item, i) => {
                        if (i === 0) {
                            attributes.to += item.emailAddress + ';';
                        } else {
                            attributes.cc += item.emailAddress + ';';
                        }

                        attributes.nameHash[item.emailAddress] = item.name;
                    });

                    Espo.Ui.notify(false);

                    callback.call(this, attributes);

                });
            })
        },
    });
});

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

define('crm:views/case/fields/contacts', ['views/fields/link-multiple-with-primary'], function (Dep) {

    return Dep.extend({

        primaryLink: 'contact',
    });
});

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

define('crm:views/case/fields/contact', ['views/fields/link'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/campaign-tracking-url/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({
    });
});

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

define('crm:views/campaign-tracking-url/record/edit-small', ['views/record/edit-small'], function (Dep) {

    return Dep.extend({
    });
});


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

define('crm:views/campaign-log-record/fields/data', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        listTemplate: 'crm:campaign-log-record/fields/data/detail',

    	getValueForDisplay: function () {
    		let action = this.model.get('action');

    		switch (action) {
    			case 'Sent':
                case 'Opened':
                    if (
                        this.model.get('objectId') &&
                        this.model.get('objectType') &&
                        this.model.get('objectName')
                    ) {
                        return $('<a>')
                            .attr('href', '#' + this.model.get('objectType') + '/view/' + this.model.get('objectId'))
                            .text(this.model.get('objectName'))
                            .get(0).outerHTML;
                    }

                    return $('<span>')
                        .text(this.model.get('stringData') || '')
                        .get(0).outerHTML;

    			case 'Clicked':
                    if (
                        this.model.get('objectId') &&
                        this.model.get('objectType') &&
                        this.model.get('objectName')
                    ) {
                        return $('<a>')
                            .attr('href', '#' + this.model.get('objectType') + '/view/' + this.model.get('objectId'))
                            .text(this.model.get('objectName'))
                            .get(0).outerHTML;
                    }

                    return $('<span>')
                        .text(this.model.get('stringData') || '')
                        .get(0).outerHTML;

                case 'Opted Out':
                    return $('<span>')
                        .text(this.model.get('stringData') || '')
                        .addClass('text-danger')
                        .get(0).outerHTML;

                case 'Bounced':
                    let emailAddress = this.model.get('stringData');
                    let type = this.model.get('stringAdditionalData');

                    let typeLabel = type === 'Hard' ?
                        this.translate('hard', 'labels', 'Campaign') :
                        this.translate('soft', 'labels', 'Campaign')

                    return $('<span>')
                        .append(
                            $('<span>')
                                .addClass('label label-default')
                                .text(typeLabel),
                            ' ',
                            $('<s>')
                                .text(emailAddress)
                                .addClass(type === 'Hard' ? 'text-danger' : '')
                        )
                        .get(0).outerHTML;
    		}

    		return '';
    	},
    });
});

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

define('crm:views/campaign/unsubscribe', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:campaign/unsubscribe',

        data: function () {
            var revertUrl;

            var actionData = this.options.actionData;

            revertUrl = actionData.hash && actionData.emailAddress ?
                '?entryPoint=subscribeAgain&emailAddress=' + actionData.emailAddress + '&hash=' + actionData.hash :
                '?entryPoint=subscribeAgain&id=' + actionData.queueItemId;

            return {
                revertUrl: revertUrl,
            };
        },
    });
});

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

define('crm:views/campaign/tracking-url', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:campaign/tracking-url',

        data: function () {
            return {
                message: this.options.message,
            };
        }

    });
});

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

define('crm:views/campaign/subscribe-again', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:campaign/subscribe-again',

        data: function () {
            var revertUrl;

            var actionData = this.options.actionData;

            if (actionData.hash && actionData.emailAddress) {
                revertUrl = '?entryPoint=unsubscribe&emailAddress=' + actionData.emailAddress +
                    '&hash=' + actionData.hash;
            } else {
                revertUrl = '?entryPoint=unsubscribe&id=' + actionData.queueItemId;
            }

            return {
                revertUrl: revertUrl,
            };
        },
    });
});

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

define('crm:views/campaign/detail', ['views/detail'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/campaign/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        bottomView: 'crm:views/campaign/record/detail-bottom',

        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);
            this.dropdownItemList.push({
                'label': 'Generate Mail Merge PDF',
                'name': 'generateMailMergePdf',
                'hidden': !this.isMailMergeAvailable()
            });

            this.listenTo(this.model, 'change', function () {
                if (this.isMailMergeAvailable()) {
                    this.showActionItem('generateMailMergePdf');
                } else {
                    this.hideActionItem('generateMailMergePdf');
                }
            }, this);
        },

        afterRender: function () {
        	Dep.prototype.afterRender.call(this);
        },

        isMailMergeAvailable: function () {
            if (this.model.get('type') !== 'Mail') {
                return false;
            }

            if (!this.model.get('targetListsIds') || !this.model.get('targetListsIds').length) {
                return false;
            }

            if (
                !this.model.get('leadsTemplateId') &&
                !this.model.get('contactsTemplateId') &&
                !this.model.get('accountsTemplateId') &&
                !this.model.get('usersTemplateId')
            ) {
                return false;
            }

            return true;
        },

        actionGenerateMailMergePdf: function () {
            this.createView('dialog', 'crm:views/campaign/modals/mail-merge-pdf', {
                model: this.model,
            }, function (view) {
                view.render();

                this.listenToOnce(view, 'proceed', (link) => {
                    this.clearView('dialog');

                    Espo.Ui.notify(' ... ');

                    Espo.Ajax.postRequest(`Campaign/${this.model.id}/generateMailMerge`, {link: link})
                        .then(response => {
                            Espo.Ui.notify(false);

                            window.open('?entryPoint=download&id=' + response.id, '_blank');
                        });
                });
            });
        },
    });
});

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

define('crm:views/campaign/record/detail-bottom', ['views/record/detail-bottom'], function (Dep) {

    return Dep.extend({

        setupPanels: function () {
            Dep.prototype.setupPanels.call(this);

            this.panelList.unshift({
                name: 'massEmails',
                label: this.translate('massEmails', 'links', 'Campaign'),
                view: 'views/record/panels/relationship',
                sticked: true,
                hidden: true,
                select: false,
                recordListView: 'crm:views/mass-email/record/list-for-campaign',
                rowActionsView: 'crm:views/mass-email/record/row-actions/for-campaign',
                index: -2,
            });

            this.panelList.unshift({
                name: 'trackingUrls',
                label: this.translate('trackingUrls', 'links', 'Campaign'),
                view: 'views/record/panels/relationship',
                sticked: true,
                hidden: true,
                select: false,
                rowActionsView: 'views/record/row-actions/relationship-no-unlink',
                index: -1,
            });

            this.listenTo(this.model, 'change', () => {
                this.manageMassEmails();
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.manageMassEmails();
        },

        manageMassEmails: function () {
            var parentView = this.getParentView();

            if (!parentView) {
                return;
            }

            if (~['Email', 'Newsletter'].indexOf(this.model.get('type'))) {
                parentView.showPanel('massEmails');
                parentView.showPanel('trackingUrls');
            } else {
                parentView.hidePanel('massEmails');
                parentView.hidePanel('trackingUrls');
            }
        },

    });
});

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

define('crm:views/campaign/record/panels/campaign-stats', ['views/record/panels/side'], function (Dep) {

    return Dep.extend({

    	controlStatsFields: function () {
    		var type = this.model.get('type');
            var fieldList;

    		switch (type) {
    			case 'Email':
    			case 'Newsletter':
                    fieldList = [
                        'sentCount',
                        'openedCount',
                        'clickedCount',
                        'optedOutCount', 'bouncedCount', 'leadCreatedCount', 'optedInCount', 'revenue'];
    				break;

    			case 'Web':
                    fieldList = ['leadCreatedCount', 'optedInCount', 'revenue'];

                    break;

    			case 'Television':
    			case 'Radio':
    				fieldList = ['leadCreatedCount', 'revenue'];

    				break;

    			case 'Mail':
    				fieldList = ['sentCount', 'leadCreatedCount', 'optedInCount', 'revenue'];

    				break;

    			default:
    				fieldList = ['leadCreatedCount', 'revenue'];
    		}

            if (!this.getConfig().get('massEmailOpenTracking')) {
                var i = fieldList.indexOf('openedCount')

                if (~i) {
                    fieldList.splice(i, 1);
                }
            }

            this.statsFieldList.forEach(item => {
                this.options.recordViewObject.hideField(item);
            });

            fieldList.forEach(item => {
                this.options.recordViewObject.showField(item);
            });

            if (!this.getAcl().checkScope('Lead')) {
                this.options.recordViewObject.hideField('leadCreatedCount');
            }

            if (!this.getAcl().checkScope('Opportunity')) {
                this.options.recordViewObject.hideField('revenue');
            }
    	},

    	setupFields: function () {
            this.fieldList = [
                'sentCount',
                'openedCount',
                'clickedCount', 'optedOutCount', 'bouncedCount', 'leadCreatedCount', 'optedInCount', 'revenue'];

            this.statsFieldList = this.fieldList;
    	},

        setup: function () {
            Dep.prototype.setup.call(this);

            this.controlStatsFields();

            this.listenTo(this.model, 'change:type', () => {
                this.controlStatsFields();
            });
        },

        actionRefresh: function () {
            this.model.fetch();
        },
    });
});

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

define('crm:views/campaign/record/panels/campaign-log-records', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        filterList: [
            "all",
            "sent",
            "opened",
            "optedOut",
            "bounced",
            "clicked",
            "optedIn",
            "leadCreated",
        ],

    	data: function () {
    		return _.extend({
    			filterList: this.filterList,
                filterValue: this.filterValue,
    		}, Dep.prototype.data.call(this));
    	},

    	setup: function () {
            if (this.getAcl().checkScope('TargetList', 'create')) {
                this.actionList.push({
                    action: 'createTargetList',
                    label: 'Create Target List',
                });
            }

            this.filterList = Espo.Utils.clone(this.filterList);

            if (!this.getConfig().get('massEmailOpenTracking')) {
                var i = this.filterList.indexOf('opened')

                if (~i) {
                    this.filterList.splice(i, 1);
                }
            }

    		Dep.prototype.setup.call(this);
    	},

        actionCreateTargetList: function () {
            var attributes = {
                sourceCampaignId: this.model.id,
                sourceCampaignName: this.model.get('name'),
            };

            if (!this.collection.data.primaryFilter) {
                attributes.includingActionList = [];
            } else {
                var status = Espo.Utils.upperCaseFirst(this.collection.data.primaryFilter).replace(/([A-Z])/g, ' $1');

                attributes.includingActionList = [status];
            }

            var viewName = this.getMetadata().get('clientDefs.TargetList.modalViews.edit') || 'views/modals/edit';

            this.createView('quickCreate', viewName, {
                scope: 'TargetList',
                attributes: attributes,
                fullFormDisabled: true,
                layoutName: 'createFromCampaignLog',
            }, (view) => {
                view.render();

                var recordView = view.getView('edit');

                if (recordView) {
                    recordView.setFieldRequired('includingActionList');
                }

                this.listenToOnce(view, 'after:save', () => {
                    Espo.Ui.success(this.translate('Done'));
                });
            });
        },
    });
});

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

define('crm:views/campaign/modals/mail-merge-pdf', ['views/modal', 'ui/select'],
function (Dep, /** module:ui/select */ Select) {

    return Dep.extend({

        template: 'crm:campaign/modals/mail-merge-pdf',

        data: function () {
            return {
                linkList: this.linkList,
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.headerText = this.translate('Generate Mail Merge PDF', 'labels', 'Campaign');

            var linkList = ['contacts', 'leads', 'accounts', 'users'];
            this.linkList = [];

            linkList.forEach(link => {
                if (!this.model.get(link + 'TemplateId')) {
                    return;
                }

                let targetEntityType = this.getMetadata()
                    .get(['entityDefs', 'TargetList', 'links', link, 'entity']);

                if (!this.getAcl().checkScope(targetEntityType)) {
                    return;
                }

                this.linkList.push(link);
            });

            this.buttonList.push({
                name: 'proceed',
                label: 'Proceed',
                style: 'danger'
            });

            this.buttonList.push({
                name: 'cancel',
                label: 'Cancel'
            });
        },

        afterRender: function () {
            Select.init(this.$el.find('.field[data-name="link"] select'));
        },

        actionProceed: function () {
            let link = this.$el.find('.field[data-name="link"] select').val();

            this.trigger('proceed', link);
        },
    });
});

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

define('crm:views/campaign/fields/template', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        createDisabled: true,

        getSelectFilters: function () {
            return {
                entityType: {
                    type: 'in',
                    value: [
                        this.getMetadata().get(['entityDefs', 'Campaign', 'fields', this.name, 'targetEntityType'])
                    ],
                }
            };
        }
    });
});

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

define('crm:views/campaign/fields/int-with-percentage', ['views/fields/int'], function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            var percentageFieldName = this.name.substr(0, this.name.length - 5) + 'Percentage';
            var value = this.model.get(this.name) ;
            var percentageValue = this.model.get(percentageFieldName);

            if (percentageValue !== null && typeof percentageValue !== 'undefined' && percentageValue) {
                value += ' ' + '(' + this.model.get(percentageFieldName) + '%)';
            }

            return value;
        },
    });
});

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

define('crm:views/call/detail', ['views/detail', 'crm:views/meeting/detail'], function (Dep, MeetingDetail) {

    return Dep.extend({

        cancellationPeriod: '8 hours',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.controlSendInvitationsButton();
            this.controlAcceptanceStatusButton();
            this.controlSendCancellationButton();

            this.listenTo(this.model, 'sync', () => {
                this.controlSendInvitationsButton();
                this.controlSendCancellationButton();
            });

            this.listenTo(this.model, 'sync', () => {
                this.controlAcceptanceStatusButton();
            });

            MeetingDetail.prototype.setupCancellationPeriod.call(this);
        },

        actionSendInvitations: function () {
            MeetingDetail.prototype.actionSendInvitations.call(this);
        },

        actionSendCancellation: function () {
            MeetingDetail.prototype.actionSendCancellation.call(this);
        },

        actionSetAcceptanceStatus: function () {
            MeetingDetail.prototype.actionSetAcceptanceStatus.call(this);
        },

        controlSendInvitationsButton: function () {
            MeetingDetail.prototype.controlSendInvitationsButton.call(this);
        },

        controlSendCancellationButton: function () {
            MeetingDetail.prototype.controlSendCancellationButton.call(this);
        },

        controlAcceptanceStatusButton: function () {
            MeetingDetail.prototype.controlAcceptanceStatusButton.call(this);
        },
    });
});

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

define('crm:views/call/record/list-expanded', ['views/record/list-expanded', 'crm:views/call/record/list'],
function (Dep, List) {

    return Dep.extend({

        actionSetHeld: function (data) {
            List.prototype.actionSetHeld.call(this, data);
        },

        actionSetNotHeld: function (data) {
            List.prototype.actionSetNotHeld.call(this, data);
        },
    });
});

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

define('crm:views/call/record/edit-small', ['views/record/edit'], function (Dep) {

    return Dep.extend({

    });
});

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

define('crm:views/call/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: true,

        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);

            if (this.getAcl().checkModel(this.model, 'edit')) {
                if (['Held', 'Not Held'].indexOf(this.model.get('status')) === -1) {
                    this.dropdownItemList.push({
                        'label': 'Set Held',
                        'name': 'setHeld',
                    });

                    this.dropdownItemList.push({
                        'label': 'Set Not Held',
                        'name': 'setNotHeld',
                    });
                }
            }
        },

        manageAccessEdit: function (second) {
            Dep.prototype.manageAccessEdit.call(this, second);

            if (second) {
                if (!this.getAcl().checkModel(this.model, 'edit', true)) {
                    this.hideActionItem('setHeld');
                    this.hideActionItem('setNotHeld');
                }
            }
        },

        actionSetHeld: function () {
            this.model.save({status: 'Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },

        actionSetNotHeld: function () {
            this.model.save({status: 'Not Held'}, {patch: true})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));

                    this.removeButton('setHeld');
                    this.removeButton('setNotHeld');
                });
        },
    });
});


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

define('crm:views/call/record/row-actions/default', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setHeld',
                    label: 'Set Held',
                    data: {
                        id: this.model.id
                    }
                });
                actionList.push({
                    action: 'setNotHeld',
                    label: 'Set Not Held',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType
                    }
                });
            }

            return actionList;
        }
    });
});

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

define('crm:views/call/record/row-actions/dashlet', ['views/record/row-actions/view-and-edit'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            var actionList = Dep.prototype.getActionList.call(this);

            if (this.options.acl.edit && !~['Held', 'Not Held'].indexOf(this.model.get('status'))) {
                actionList.push({
                    action: 'setHeld',
                    label: 'Set Held',
                    data: {
                        id: this.model.id
                    }
                });

                actionList.push({
                    action: 'setNotHeld',
                    label: 'Set Not Held',
                    data: {
                        id: this.model.id
                    }
                });
            }

            if (this.options.acl.delete) {
                actionList.push({
                    action: 'quickRemove',
                    label: 'Remove',
                    data: {
                        id: this.model.id,
                        scope: this.model.entityType
                    }
                });
            }

            return actionList;
        }
    });
});

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

define('crm:views/call/fields/leads', ['crm:views/meeting/fields/attendees', 'crm:views/call/fields/contacts'],
function (Dep, Contacts) {

    return Dep.extend({

        getAttributeList: function () {
            let list = Dep.prototype.getAttributeList.call(this);

            list.push('phoneNumbersMap');

            return list;
        },

        getDetailLinkHtml: function (id, name) {
            return Contacts.prototype.getDetailLinkHtml.call(this, id, name);
        },

        getDetailLinkHtml1: function (id, name) {
            var html = Dep.prototype.getDetailLinkHtml.call(this, id, name);

            var key = this.foreignScope + '_' + id;
            var number = null;
            var phoneNumbersMap = this.model.get('phoneNumbersMap') || {};
            if (key in phoneNumbersMap) {
                number = phoneNumbersMap[key];
                var innerHtml = $(html).html();

                innerHtml += (
                    ' <span class="text-muted chevron-right"></span> ' +
                    '<a href="tel:' + number + '" class="small" data-phone-number="' + number + '" data-action="dial">' +
                    number + '</a>'
                );

                html = '<div>' + innerHtml + '</div>';
            }

            return html;
        },
    });
});

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

define('crm:views/call/fields/date-end', ['views/fields/datetime'], function (Dep) {

    return Dep.extend({

        validateAfter: function () {
            var field = this.model.getFieldParam(this.name, 'after');

            if (field) {
                var value = this.model.get(this.name);
                var otherValue = this.model.get(field);

                if (value && otherValue) {
                    if (moment(value).unix() < moment(otherValue).unix()) {
                        var msg = this.translate('fieldShouldAfter', 'messages')
                            .replace('{field}', this.getLabelText())
                            .replace('{otherField}', this.translate(field, 'fields', this.entityType));

                        this.showValidationMessage(msg);

                        return true;
                    }
                }
            }
        },
    });
});

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

/** @module modules/crm/views/calendar/mode-buttons */

define('crm:views/calendar/mode-buttons', ['view'], function (Dep) {

    return Dep.extend({

        template: 'crm:calendar/mode-buttons',

        visibleModeListCount: 3,

        data: function () {
            let scopeFilterList = Espo.Utils.clone(this.scopeList);
            scopeFilterList.unshift('all');

            var scopeFilterDataList = [];

            this.scopeList.forEach(scope => {
                let o = {scope: scope};

                if (!~this.getParentView().enabledScopeList.indexOf(scope)) {
                    o.disabled = true;
                }

                scopeFilterDataList.push(o);
            });

            return {
                mode: this.mode,
                visibleModeDataList: this.getVisibleModeDataList(),
                hiddenModeDataList: this.getHiddenModeDataList(),
                scopeFilterDataList: scopeFilterDataList,
                isCustomViewAvailable: this.isCustomViewAvailable,
                hasMoreItems: this.isCustomViewAvailable,
                hasWorkingTimeCalendarLink: this.getAcl().checkScope('WorkingTimeCalendar'),
            };
        },

        setup: function () {
            this.isCustomViewAvailable = this.options.isCustomViewAvailable;
            this.modeList = this.options.modeList;
            this.scopeList = this.options.scopeList;
            this.mode = this.options.mode;
        },

        /**
         * @param {boolean} originalOrder
         * @return {Object.<string, *>[]}
         */
        getModeDataList: function (originalOrder) {
            var list = [];

            this.modeList.forEach(name => {
                var o = {
                    mode: name,
                    label: this.translate(name, 'modes', 'Calendar'),
                    labelShort: this.translate(name, 'modes', 'Calendar').substr(0, 2),
                };

                list.push(o);
            });

            if (this.isCustomViewAvailable) {
                (this.getPreferences().get('calendarViewDataList') || []).forEach(item => {
                    item = Espo.Utils.clone(item);

                    item.mode = 'view-' + item.id;
                    item.label = item.name;
                    item.labelShort = (item.name || '').substr(0, 2);
                    list.push(item);
                });
            }

            if (originalOrder) {
                return list;
            }

            let currentIndex = -1;

            list.forEach((item, i) => {
                if (item.mode === this.mode) {
                    currentIndex = i;
                }
            });

            if (currentIndex >= this.visibleModeListCount) {
                let tmp = list[this.visibleModeListCount - 1];

                list[this.visibleModeListCount - 1] = list[currentIndex];
                list[currentIndex] = tmp;
            }

            return list;
        },

        getVisibleModeDataList: function () {
            var fullList =  this.getModeDataList();

            var list = [];

            fullList.forEach((o, i) => {
                if (i >= this.visibleModeListCount) {
                    return;
                }

                list.push(o);
            });

            return list;
        },

        getHiddenModeDataList: function () {
            var fullList =  this.getModeDataList();

            var list = [];

            fullList.forEach((o, i) => {
                if (i < this.visibleModeListCount) {
                    return;
                }

                list.push(o);
            });

            return list;
        },
    });
});

define("modules/crm/views/calendar/calendar-page", ["exports", "view"], function (_exports, _view) {
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

  class CalendarPage extends _view.default {
    template = 'crm:calendar/calendar-page';
    el = '#main';
    fullCalendarModeList = ['month', 'agendaWeek', 'agendaDay', 'basicWeek', 'basicDay', 'listWeek'];
    events = {
      /** @this CalendarPage */
      'click [data-action="createCustomView"]': function () {
        this.createCustomView();
      },
      /** @this CalendarPage */
      'click [data-action="editCustomView"]': function () {
        this.editCustomView();
      }
    };

    /**
     * A shortcut-key => action map.
     *
     * @protected
     * @type {?Object.<string,function (JQueryKeyEventObject): void>}
     */
    shortcutKeys = {
      /** @this CalendarPage */
      'Home': function (e) {
        this.handleShortcutKeyHome(e);
      },
      /** @this CalendarPage */
      'Numpad7': function (e) {
        this.handleShortcutKeyHome(e);
      },
      /** @this CalendarPage */
      'Numpad4': function (e) {
        this.handleShortcutKeyArrowLeft(e);
      },
      /** @this CalendarPage */
      'Numpad6': function (e) {
        this.handleShortcutKeyArrowRight(e);
      },
      /** @this CalendarPage */
      'ArrowLeft': function (e) {
        this.handleShortcutKeyArrowLeft(e);
      },
      /** @this CalendarPage */
      'ArrowRight': function (e) {
        this.handleShortcutKeyArrowRight(e);
      },
      /** @this CalendarPage */
      'Minus': function (e) {
        this.handleShortcutKeyMinus(e);
      },
      /** @this CalendarPage */
      'Equal': function (e) {
        this.handleShortcutKeyPlus(e);
      },
      /** @this CalendarPage */
      'NumpadSubtract': function (e) {
        this.handleShortcutKeyMinus(e);
      },
      /** @this CalendarPage */
      'NumpadAdd': function (e) {
        this.handleShortcutKeyPlus(e);
      },
      /** @this CalendarPage */
      'Digit1': function (e) {
        this.handleShortcutKeyDigit(e, 1);
      },
      /** @this CalendarPage */
      'Digit2': function (e) {
        this.handleShortcutKeyDigit(e, 2);
      },
      /** @this CalendarPage */
      'Digit3': function (e) {
        this.handleShortcutKeyDigit(e, 3);
      },
      /** @this CalendarPage */
      'Digit4': function (e) {
        this.handleShortcutKeyDigit(e, 4);
      },
      /** @this CalendarPage */
      'Digit5': function (e) {
        this.handleShortcutKeyDigit(e, 5);
      },
      /** @this CalendarPage */
      'Digit6': function (e) {
        this.handleShortcutKeyDigit(e, 6);
      },
      /** @this CalendarPage */
      'Control+Space': function (e) {
        this.handleShortcutKeyControlSpace(e);
      }
    };
    setup() {
      this.mode = this.mode || this.options.mode || null;
      this.date = this.date || this.options.date || null;
      if (!this.mode) {
        this.mode = this.getStorage().get('state', 'calendarMode') || null;
        if (this.mode && this.mode.indexOf('view-') === 0) {
          let viewId = this.mode.slice(5);
          let calendarViewDataList = this.getPreferences().get('calendarViewDataList') || [];
          let isFound = false;
          calendarViewDataList.forEach(item => {
            if (item.id === viewId) {
              isFound = true;
            }
          });
          if (!isFound) {
            this.mode = null;
          }
          if (this.options.userId) {
            this.mode = null;
          }
        }
      }
      this.events['keydown.main'] = e => {
        let key = Espo.Utils.getKeyFromKeyEvent(e);
        if (typeof this.shortcutKeys[key] === 'function') {
          this.shortcutKeys[key].call(this, e.originalEvent);
        }
      };
      if (!this.mode || ~this.fullCalendarModeList.indexOf(this.mode) || this.mode.indexOf('view-') === 0) {
        this.setupCalendar();
      } else {
        if (this.mode === 'timeline') {
          this.setupTimeline();
        }
      }
    }
    afterRender() {
      this.$el.focus();
    }
    updateUrl(trigger) {
      let url = '#Calendar/show';
      if (this.mode || this.date) {
        url += '/';
      }
      if (this.mode) {
        url += 'mode=' + this.mode;
      }
      if (this.date) {
        url += '&date=' + this.date;
      }
      if (this.options.userId) {
        url += '&userId=' + this.options.userId;
        if (this.options.userName) {
          url += '&userName=' + encodeURIComponent(this.options.userName);
        }
      }
      this.getRouter().navigate(url, {
        trigger: trigger
      });
    }
    setupCalendar() {
      let viewName = this.getMetadata().get(['clientDefs', 'Calendar', 'calendarView']) || 'crm:views/calendar/calendar';
      this.createView('calendar', viewName, {
        date: this.date,
        userId: this.options.userId,
        userName: this.options.userName,
        mode: this.mode,
        fullSelector: '#main > .calendar-container'
      }, view => {
        let initial = true;
        this.listenTo(view, 'view', (date, mode) => {
          this.date = date;
          this.mode = mode;
          if (!initial) {
            this.updateUrl();
          }
          initial = false;
        });
        this.listenTo(view, 'change:mode', (mode, refresh) => {
          this.mode = mode;
          if (!this.options.userId) {
            this.getStorage().set('state', 'calendarMode', mode);
          }
          if (refresh) {
            this.updateUrl(true);
            return;
          }
          if (!~this.fullCalendarModeList.indexOf(mode)) {
            this.updateUrl(true);
          }
          this.$el.focus();
        });
      });
    }
    setupTimeline() {
      var viewName = this.getMetadata().get(['clientDefs', 'Calendar', 'timelineView']) || 'crm:views/calendar/timeline';
      this.createView('calendar', viewName, {
        date: this.date,
        userId: this.options.userId,
        userName: this.options.userName,
        fullSelector: '#main > .calendar-container'
      }, view => {
        let initial = true;
        this.listenTo(view, 'view', (date, mode) => {
          this.date = date;
          this.mode = mode;
          if (!initial) {
            this.updateUrl();
          }
          initial = false;
        });
        this.listenTo(view, 'change:mode', mode => {
          this.mode = mode;
          if (!this.options.userId) {
            this.getStorage().set('state', 'calendarMode', mode);
          }
          this.updateUrl(true);
        });
      });
    }
    updatePageTitle() {
      this.setPageTitle(this.translate('Calendar', 'scopeNames'));
    }
    createCustomView() {
      this.createView('createCustomView', 'crm:views/calendar/modals/edit-view', {}, view => {
        view.render();
        this.listenToOnce(view, 'after:save', data => {
          view.close();
          this.mode = 'view-' + data.id;
          this.date = null;
          this.updateUrl(true);
        });
      });
    }
    editCustomView() {
      let viewId = this.getCalendarView().viewId;
      if (!viewId) {
        return;
      }
      this.createView('createCustomView', 'crm:views/calendar/modals/edit-view', {
        id: viewId
      }, view => {
        view.render();
        this.listenToOnce(view, 'after:save', () => {
          view.close();
          let calendarView = this.getCalendarView();
          calendarView.setupMode();
          calendarView.reRender();
        });
        this.listenToOnce(view, 'after:remove', () => {
          view.close();
          this.mode = null;
          this.date = null;
          this.updateUrl(true);
        });
      });
    }

    /**
     * @private
     * @return {module:modules/crm/views/calendar/calendar | module:modules/crm/views/calendar/timeline}
     */
    getCalendarView() {
      return this.getView('calendar');
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyHome(e) {
      e.preventDefault();
      this.getCalendarView().actionToday();
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyArrowLeft(e) {
      e.preventDefault();
      this.getCalendarView().actionPrevious();
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyArrowRight(e) {
      e.preventDefault();
      this.getCalendarView().actionNext();
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyMinus(e) {
      if (!this.getCalendarView().actionZoomOut) {
        return;
      }
      e.preventDefault();
      this.getCalendarView().actionZoomOut();
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyPlus(e) {
      if (!this.getCalendarView().actionZoomIn) {
        return;
      }
      e.preventDefault();
      this.getCalendarView().actionZoomIn();
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     * @param {Number} digit
     */
    handleShortcutKeyDigit(e, digit) {
      let modeList = this.getCalendarView().hasView('modeButtons') ? this.getCalendarView().getModeButtonsView().getModeDataList(true).map(item => item.mode) : this.getCalendarView().modeList;
      let mode = modeList[digit - 1];
      if (!mode) {
        return;
      }
      e.preventDefault();
      if (mode === this.mode) {
        this.getCalendarView().actionRefresh();
        return;
      }
      this.getCalendarView().selectMode(mode);
    }

    /**
     * @private
     * @param {JQueryKeyEventObject} e
     */
    handleShortcutKeyControlSpace(e) {
      if (!this.getCalendarView().createEvent) {
        return;
      }
      e.preventDefault();
      this.getCalendarView().createEvent();
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = CalendarPage;
  _exports.default = _default;
});

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

define('crm:views/calendar/record/shared-options', ['views/record/base'], function (Dep) {

    return Dep.extend({

        template: 'crm:calendar/record/shared-options',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createField('users', 'crm:views/calendar/fields/users');
        },
    });
});

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

define('crm:views/calendar/record/edit-view', ['views/record/base'], function (Dep) {

    return Dep.extend({

        template: 'crm:calendar/record/edit-view',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createField('mode', 'views/fields/enum', {
                options: this.getMetadata().get(['clientDefs', 'Calendar', 'sharedViewModeList']) || [],
                translation: 'DashletOptions.options.mode'
            }, null, null, {
                labelText: this.translate('mode', 'fields', 'DashletOptions')
            });

            this.createField('name', 'views/fields/varchar', {
                required: true
            }, null, null, {
                labelText: this.translate('name', 'fields')
            });

            this.createField('teams', 'crm:views/calendar/fields/teams', {
                required: true
            }, null, null, {
                labelText: this.translate('teams', 'fields'),
                foreignScope: 'Team'
            });
        },
    });
});

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

define('crm:views/calendar/modals/shared-options', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        className: 'dialog dialog-record',

        template: 'crm:calendar/modals/shared-options',

        buttonList: [
            {
                name: 'save',
                label: 'Save',
                style: 'primary',
            },
            {
                name: 'cancel',
                label: 'Cancel',
            },
        ],

        setup: function () {
            var userList = this.options.userList || [];

            var userIdList = [];
            var userNames = {};

            userList.forEach(item => {
                userIdList.push(item.id);
                userNames[item.id] = item.name;
            });

            var model = new Model();

            model.name = 'SharedCalendarOptions';

            model.set({
                usersIds: userIdList,
                usersNames: userNames
            });

            this.createView('record', 'crm:views/calendar/record/shared-options', {
                selector: '.record-container',
                model: model,
            });
        },

        actionSave: function () {
            var data = this.getView('record').fetch();

            var userList = [];

            (data.usersIds || []).forEach(id => {
                userList.push({
                    id: id,
                    name: (data.usersNames || {})[id] || id
                });
            });

            this.trigger('save', {
                userList: userList
            });

            this.remove();
        },
    });
});

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

define('crm:views/calendar/modals/edit', ['views/modals/edit'], function (Dep) {

    return Dep.extend({

        template: 'crm:calendar/modals/edit',

        scopeList: [
            'Meeting',
            'Call',
            'Task',
        ],

        data: function () {
            return {
                scopeList: this.scopeList,
                scope: this.scope,
                isNew: !(this.id),
            };
        },

        additionalEvents: {
            'change .scope-switcher input[name="scope"]': function () {
                Espo.Ui.notify(' ... ');

                let scope = $('.scope-switcher input[name="scope"]:checked').val();
                this.scope = scope;

                this.getModelFactory().create(this.scope, model => {
                    model.populateDefaults();

                    let attributes = this.getRecordView().fetch();

                    attributes = {...attributes, ...this.getRecordView().model.getClonedAttributes()};

                    this.filterAttributesForEntityType(attributes, scope);

                    model.set(attributes);

                    this.model = model;

                    this.createRecordView(model, (view) => {
                        view.render();
                        view.notify(false);
                    });

                    this.handleAccess(model);
                });
            },
        },

        filterAttributesForEntityType: function (attributes, entityType) {
            this.getHelper()
                .fieldManager
                .getEntityTypeFieldList(entityType, {type: 'enum'})
                .forEach(field => {
                    if (!(field in attributes)) {
                        return;
                    }

                    let options = this.getMetadata().get(['entityDefs', entityType, 'fields', field, 'options']) || [];

                    let value = attributes[field];

                    if (!~options.indexOf(value)) {
                        delete attributes[field];
                    }
                });
        },

        createRecordView: function (model, callback) {
            if (!this.id && !this.dateIsChanged) {
                if (this.options.dateStart && this.options.dateEnd) {
                    this.model.set('dateStart', this.options.dateStart);
                    this.model.set('dateEnd', this.options.dateEnd);
                }

                if (this.options.allDay) {
                    var allDayScopeList = this.getMetadata().get('clientDefs.Calendar.allDayScopeList') || [];

                    if (~allDayScopeList.indexOf(this.scope)) {
                        this.model.set('dateStart', null);
                        this.model.set('dateEnd', null);
                        this.model.set('dateStartDate', null);
                        this.model.set('dateEndDate', this.options.dateEndDate);

                        if (this.options.dateEndDate !== this.options.dateStartDate) {
                            this.model.set('dateStartDate', this.options.dateStartDate);
                        }
                    }
                    else if (this.getMetadata().get(['entityDefs', this.scope, 'fields', 'dateStartDate'])) {
                        this.model.set('dateStart', null);
                        this.model.set('dateEnd', null);
                        this.model.set('dateStartDate', this.options.dateStartDate);
                        this.model.set('dateEndDate', this.options.dateEndDate);
                        this.model.set('isAllDay', true);
                    }
                    else {
                        this.model.set('isAllDay', false);
                        this.model.set('dateStartDate', null);
                        this.model.set('dateEndDate', null);
                    }
                }
            }

            this.listenTo(this.model, 'change:dateStart', (m, value, o) => {
                if (o.ui) {
                    this.dateIsChanged = true;
                }
            });

            this.listenTo(this.model, 'change:dateEnd', (m, value, o) => {
                if (o.ui || o.updatedByDuration) {
                    this.dateIsChanged = true;
                }
            });

            Dep.prototype.createRecordView.call(this, model, callback);
        },

        handleAccess: function (model) {
            if (
                this.id &&
                !this.getAcl().checkModel(model, 'edit') || !this.id &&
                !this.getAcl().checkModel(model, 'create')
            ) {
                this.hideButton('save');
                this.hideButton('fullForm');

                this.$el.find('button[data-name="save"]').addClass('hidden');
                this.$el.find('button[data-name="fullForm"]').addClass('hidden');
            }
            else {
                this.showButton('save');
                this.showButton('fullForm');
            }

            if (!this.getAcl().checkModel(model, 'delete')) {
                this.hideButton('remove');
            } else {
                this.showButton('remove');
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.hasView('edit')) {
                var model = this.getView('edit').model;

                if (model) {
                    this.handleAccess(model);
                }
            }
        },

        setup: function () {
            this.events = {
                ...this.additionalEvents,
                ...this.events,
            };

            this.scopeList = Espo.Utils.clone(this.options.scopeList || this.scopeList);
            this.enabledScopeList = this.options.enabledScopeList || this.scopeList;

            if (!this.options.id && !this.options.scope) {
                var scopeList = [];

                this.scopeList.forEach((scope) => {
                    if (this.getAcl().check(scope, 'create')) {
                        if (~this.enabledScopeList.indexOf(scope)) {
                            scopeList.push(scope);
                        }
                    }
                });

                this.scopeList = scopeList;

                var calendarDefaultEntity = scopeList[0];

                if (calendarDefaultEntity && ~this.scopeList.indexOf(calendarDefaultEntity)) {
                    this.options.scope = calendarDefaultEntity;
                } else {
                    this.options.scope = this.scopeList[0] || null;
                }

                if (this.scopeList.length === 0) {
                    this.remove();
                    return;
                }
            }

            Dep.prototype.setup.call(this);

            if (!this.id) {
                this.$header = $('<a>')
                    .attr('title', this.translate('Full Form'))
                    .attr('role', 'button')
                    .attr('data-action', 'fullForm')
                    .addClass('action')
                    .text(this.translate('Create', 'labels', 'Calendar'));
            }

            if (this.id) {
                this.buttonList.splice(1, 0, {
                    name: 'remove',
                    text: this.translate('Remove')
                });
            }

            this.once('after:save', () => {
                this.$el.find('.scope-switcher').remove();
            })
        },

        actionRemove: function () {
            let model = this.getView('edit').model;

            this.confirm(this.translate('removeRecordConfirmation', 'messages'), () => {
                let $buttons = this.dialog.$el.find('.modal-footer button');

                $buttons.addClass('disabled');

                model.destroy()
                    .then(() => {
                        this.trigger('after:destroy', model);
                        this.dialog.close();
                    })
                    .catch(() => {
                        $buttons.removeClass('disabled');
                    });
            });
        },
    });
});

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

define('crm:views/calendar/modals/edit-view', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        // language=Handlebars
        templateContent: '' +
            '<div class="panel panel-default no-side-margin"><div class="panel-body">' +
            '<div class="record-container">{{{record}}}</div>' +
            '</div></div>',

        className: 'dialog dialog-record',

        buttonList: [
            {
                name: 'cancel',
                label: 'Cancel',
            }
        ],

        setup: function () {
            var id = this.options.id;

            this.isNew = !id;

            var calendarViewDataList = this.getPreferences().get('calendarViewDataList') || [];

            if (this.isNew) {
                this.buttonList.unshift({
                    name: 'save',
                    label: 'Create',
                    style: 'danger'
                });
            }
            else {
                this.buttonList.unshift({
                    name: 'remove',
                    label: 'Remove'
                });

                this.buttonList.unshift({
                    name: 'save',
                    label: 'Save',
                    style: 'primary'
                });
            }

            var model = new Model();

            model.name = 'CalendarView';

            var modelData = {};

            if (!this.isNew) {
                calendarViewDataList.forEach(item => {
                    if (id === item.id) {
                        modelData.teamsIds = item.teamIdList || [];
                        modelData.teamsNames = item.teamNames || {};
                        modelData.id = item.id;
                        modelData.name = item.name;
                        modelData.mode = item.mode;
                    }
                });
            }
            else {
                modelData.name = this.translate('Shared', 'labels', 'Calendar');

                var foundCount = 0;

                calendarViewDataList.forEach(item => {
                    if (item.name.indexOf(modelData.name) === 0) {
                        foundCount++;
                    }
                });

                if (foundCount) {
                    modelData.name += ' ' + foundCount;
                }

                modelData.id = id;

                modelData.teamsIds = this.getUser().get('teamsIds') || [];
                modelData.teamsNames = this.getUser().get('teamsNames') || {};
            }

            model.set(modelData);

            this.createView('record', 'crm:views/calendar/record/edit-view', {
                selector: '.record-container',
                model: model
            });
        },

        actionSave: function () {
            var modelData = this.getView('record').fetch();
            this.getView('record').model.set(modelData);

            if (this.getView('record').validate()) {
                return;
            }

            this.disableButton('save');
            this.disableButton('remove');

            var calendarViewDataList = this.getPreferences().get('calendarViewDataList') || [];

            var data = {
                name: modelData.name,
                teamIdList: modelData.teamsIds,
                teamNames: modelData.teamsNames,
                mode: modelData.mode
            };

            if (this.isNew) {
                data.id = Math.random().toString(36).substr(2, 10);
                calendarViewDataList.push(data);
            } else {
                data.id = this.getView('record').model.id;

                calendarViewDataList.forEach((item, i) => {
                    if (item.id === data.id) {
                        calendarViewDataList[i] = data;
                    }
                });
            }

            Espo.Ui.notify(this.translate('saving', 'messages'));

            this.getPreferences()
                .save(
                    {
                        'calendarViewDataList': calendarViewDataList,
                    },
                    {patch: true}
                )
                .then(() => {
                    Espo.Ui.notify(false);
                        this.trigger('after:save', data);
                        this.remove();
                })
                .catch(() => {
                    this.enableButton('remove');
                    this.enableButton('save');
                });
        },

        actionRemove: function () {
            this.confirm(this.translate('confirmation', 'messages'), () => {
                this.disableButton('save');
                this.disableButton('remove');

                var id = this.options.id;

                if (!id) {
                    return;
                }

                var newCalendarViewDataList = [];

                var calendarViewDataList = this.getPreferences().get('calendarViewDataList') || [];

                calendarViewDataList.forEach((item) => {
                    if (item.id !== id) {
                        newCalendarViewDataList.push(item);
                    }
                });

                Espo.Ui.notify(' ... ');

                this.getPreferences()
                    .save({
                        'calendarViewDataList': newCalendarViewDataList
                    }, {patch: true})
                    .then(() => {
                        Espo.Ui.notify(false);
                        this.trigger('after:remove');
                        this.remove();
                    })
                    .catch(() => {
                        this.enableButton('remove');
                        this.enableButton('save');
                    });
            });
        }
    });
});

define("modules/crm/views/calendar/fields/users", ["exports", "views/fields/link-multiple"], function (_exports, _linkMultiple) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _linkMultiple = _interopRequireDefault(_linkMultiple);
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

  class CalendarUsersFieldView extends _linkMultiple.default {
    foreignScope = 'User';
    sortable = true;
    getSelectBoolFilterList() {
      if (this.getAcl().getPermissionLevel('userPermission') === 'team') {
        return ['onlyMyTeam'];
      }
    }
    getSelectPrimaryFilterName() {
      return 'active';
    }
  }
  var _default = CalendarUsersFieldView;
  _exports.default = _default;
});

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

define('crm:views/calendar/fields/teams', ['views/fields/link-multiple'], function (Dep) {

    return Dep.extend({

        foreignScope: 'Team',

        getSelectBoolFilterList: function () {
            if (this.getAcl().get('userPermission') === 'team') {
                return ['onlyMy'];
            }
        }
    });
});

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

define('crm:views/admin/entity-manager/fields/status-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            let entityType = this.model.get('name');

            this.params.options = Espo.Utils.clone(
                this.getMetadata().get(['entityDefs', entityType, 'fields', 'status', 'options'])) || [];

            this.params.translation = `${entityType}.options.status`;
        },
    });
});

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

 define('crm:views/activities/list', ['views/list-related'], function (Dep) {

    return Dep.extend({

        createButton: false,

        unlinkDisabled: true,

        filtersDisabled: true,

        setup: function () {
            this.rowActionsView = 'views/record/row-actions/default';

            Dep.prototype.setup.call(this);

            this.type = this.options.type;
        },

        getHeader: function () {
            let name = this.model.get('name') || this.model.id;

            let recordUrl = '#' + this.scope  + '/view/' + this.model.id;

            let $name =
                $('<a>')
                    .attr('href', recordUrl)
                    .addClass('font-size-flexible title')
                    .text(name);

            if (this.model.get('deleted')) {
                $name.css('text-decoration', 'line-through');
            }

            let headerIconHtml = this.getHelper().getScopeColorIconHtml(this.foreignScope);
            let scopeLabel = this.getLanguage().translate(this.scope, 'scopeNamesPlural');

            let $root = $('<span>').text(scopeLabel);

            if (!this.rootLinkDisabled) {
                $root = $('<span>')
                    .append(
                        $('<a>')
                            .attr('href', '#' + this.scope)
                            .addClass('action')
                            .attr('data-action', 'navigateToRoot')
                            .text(scopeLabel)
                    );
            }

            if (headerIconHtml) {
                $root.prepend(headerIconHtml);
            }

            let linkLabel = this.type === 'history' ? this.translate('History') : this.translate('Activities');

            let $link = $('<span>').text(linkLabel);

            let $target = $('<span>').text(this.translate(this.foreignScope, 'scopeNamesPlural'));

            return this.buildHeaderHtml([
                $root,
                $name,
                $link,
                $target,
            ]);
        },

        /**
         * @inheritDoc
         */
        updatePageTitle: function () {
            this.setPageTitle(this.translate(this.foreignScope, 'scopeNamesPlural'));
        },
    });
});

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

define('crm:views/account/detail', ['views/detail'], function (Dep) {

    /** Left for bc. */
    return Dep.extend({});
});

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

define('crm:views/account/fields/shipping-address', ['views/fields/address'], function (Dep) {

    return Dep.extend({

        copyFrom: 'billingAddress',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.attributePartList = this.getMetadata().get(['fields', 'address', 'actualFields']) || [];

            this.allAddressAttributeList = [];

            this.attributePartList.forEach(part => {
                this.allAddressAttributeList.push(this.copyFrom + Espo.Utils.upperCaseFirst(part));
                this.allAddressAttributeList.push(this.name + Espo.Utils.upperCaseFirst(part));
            });

            this.listenTo(this.model, 'change', () => {
                var isChanged = false;

                this.allAddressAttributeList.forEach(attribute => {
                    if (this.model.hasChanged(attribute)) {
                        isChanged = true;
                    }
                });

                if (isChanged) {
                    if (this.isEditMode() && this.isRendered() && this.$copyButton) {
                        if (this.toShowCopyButton()) {
                            this.$copyButton.removeClass('hidden');
                        } else {
                            this.$copyButton.addClass('hidden');
                        }
                    }
                }
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === 'edit') {
                var label = this.translate('Copy Billing', 'labels', 'Account');
                this.$copyButton = $('<button class="btn btn-default btn-sm">' + label + '</button>');

                this.$copyButton.on('click', () => {
                    this.copy(this.copyFrom);
                });

                if (!this.toShowCopyButton()) {
                    this.$copyButton.addClass('hidden');
                }

                this.$el.append(this.$copyButton);
            }
        },

        copy: function (fieldFrom) {
            Object.keys(this.getMetadata().get('fields.address.fields'))
                .forEach(attr => {
                    let destField = this.name + Espo.Utils.upperCaseFirst(attr);
                    let sourceField = fieldFrom + Espo.Utils.upperCaseFirst(attr);

                    this.model.set(destField, this.model.get(sourceField));
                });
        },

        toShowCopyButton: function () {
            var billingIsNotEmpty = false;
            var shippingIsNotEmpty = false;

            this.attributePartList.forEach(part => {
                let attribute1 = this.copyFrom + Espo.Utils.upperCaseFirst(part);

                if (this.model.get(attribute1)) {
                    billingIsNotEmpty = true;
                }

                let attribute2 = this.name + Espo.Utils.upperCaseFirst(part);

                if (this.model.get(attribute2)) {
                    shippingIsNotEmpty = true;
                }
            });

            return billingIsNotEmpty && !shippingIsNotEmpty;
        },
    });
});

define("modules/crm/view-setup-handlers/document/record-list-drag-n-drop", ["exports", "underscore", "bullbone"], function (_exports, _underscore, _bullbone) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _underscore = _interopRequireDefault(_underscore);
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

  let Handler = function (view) {
    this.view = view;
  };
  _underscore.default.extend(Handler.prototype, {
    process: function () {
      this.listenTo(this.view, 'after:render', () => this.initDragDrop());
      this.listenTo(this.view, 'remove', () => this.disable());
    },
    disable: function () {
      let $el = this.view.$el.parent();
      /** @type {Element} */
      let el = $el.get(0);
      $el.off('drop');
      if (!el) {
        return;
      }
      if (!this.onDragoverBind) {
        return;
      }
      el.removeEventListener('dragover', this.onDragoverBind);
      el.removeEventListener('dragenter', this.onDragenterBind);
      el.removeEventListener('dragleave', this.onDragleaveBind);
    },
    initDragDrop: function () {
      this.disable();
      let $el = this.view.$el.parent();
      let el = $el.get(0);
      $el.on('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        e = e.originalEvent;
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length === 1 && this.dropEntered) {
          this.removeDrop();
          this.create(e.dataTransfer.files[0]);
          return;
        }
        this.removeDrop($el);
      });
      this.dropEntered = false;
      this.onDragoverBind = this.onDragover.bind(this);
      this.onDragenterBind = this.onDragenter.bind(this);
      this.onDragleaveBind = this.onDragleave.bind(this);
      el.addEventListener('dragover', this.onDragoverBind);
      el.addEventListener('dragenter', this.onDragenterBind);
      el.addEventListener('dragleave', this.onDragleaveBind);
    },
    renderDrop: function () {
      this.dropEntered = true;
      let $backdrop = $('<div class="dd-backdrop">').css('pointer-events', 'none').append('<span class="fas fa-paperclip"></span>').append(' ').append($('<span>').text(this.view.getLanguage().translate('Create Document', 'labels', 'Document')));
      this.view.$el.append($backdrop);
    },
    removeDrop: function () {
      this.view.$el.find('> .dd-backdrop').remove();
      this.dropEntered = false;
    },
    create: function (file) {
      this.view.actionQuickCreate().then(view => {
        let fileView = view.getRecordView().getFieldView('file');
        if (!fileView) {
          let msg = "No 'file' field on the layout.";
          Espo.Ui.error(msg);
          console.error(msg);
          return;
        }
        if (fileView.isRendered()) {
          fileView.uploadFile(file);
          return;
        }
        this.listenToOnce(fileView, 'after:render', () => {
          fileView.uploadFile(file);
        });
      });
    },
    /**
     * @param {DragEvent} e
     */
    onDragover: function (e) {
      e.preventDefault();
    },
    /**
     * @param {DragEvent} e
     */
    onDragenter: function (e) {
      e.preventDefault();
      if (!e.dataTransfer.types || !e.dataTransfer.types.length) {
        return;
      }
      if (!~e.dataTransfer.types.indexOf('Files')) {
        return;
      }
      if (!this.dropEntered) {
        this.renderDrop();
      }
    },
    /**
     * @param {DragEvent} e
     */
    onDragleave: function (e) {
      e.preventDefault();
      if (!this.dropEntered) {
        return;
      }
      let fromElement = e.fromElement || e.relatedTarget;
      if (fromElement && $.contains(this.view.$el.parent().get(0), fromElement)) {
        return;
      }
      if (fromElement && fromElement.parentNode && fromElement.parentNode.toString() === '[object ShadowRoot]') {
        return;
      }
      this.removeDrop();
    }
  });
  Object.assign(Handler.prototype, _bullbone.Events);

  // noinspection JSUnusedGlobalSymbols
  var _default = Handler;
  _exports.default = _default;
});

define("modules/crm/handlers/task/menu", ["exports", "action-handler"], function (_exports, _actionHandler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _actionHandler = _interopRequireDefault(_actionHandler);
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

  class TaskMenuHandler extends _actionHandler.default {
    complete() {
      const model = this.view.model;
      model.save({
        status: 'Completed'
      }, {
        patch: true
      }).then(() => {
        Espo.Ui.success(this.view.getLanguage().translateOption('Completed', 'status', 'Task'));
      });
    }

    // noinspection JSUnusedGlobalSymbols
    isCompleteAvailable() {
      const status = this.view.model.get('status');
      const view = /** @type {module:views/detail} */this.view;
      if (view.getRecordView().isEditMode()) {
        return false;
      }

      /** @type {string[]} */
      const notActualStatuses = this.view.getMetadata().get('entityDefs.Task.fields.status.notActualOptions') || [];
      return !notActualStatuses.includes(status);
    }
  }
  var _default = TaskMenuHandler;
  _exports.default = _default;
});

define("modules/crm/handlers/task/detail-actions", ["exports", "action-handler"], function (_exports, _actionHandler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _actionHandler = _interopRequireDefault(_actionHandler);
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

  class DetailActions extends _actionHandler.default {
    complete() {
      const model = this.view.model;
      model.save({
        status: 'Completed'
      }, {
        patch: true
      }).then(() => {
        Espo.Ui.success(this.view.getLanguage().translateOption('Completed', 'status', 'Task'));
      });
    }

    // noinspection JSUnusedGlobalSymbols
    isCompleteAvailable() {
      const status = this.view.model.get('status');

      /** @type {string[]} */
      const notActualStatuses = this.view.getMetadata().get('entityDefs.Task.fields.status.notActualOptions') || [];
      return !notActualStatuses.includes(status);
    }
  }
  var _default = DetailActions;
  _exports.default = _default;
});

define("modules/crm/handlers/opportunity/contacts-create", ["exports", "handlers/create-related"], function (_exports, _createRelated) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _createRelated = _interopRequireDefault(_createRelated);
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

  class ContactsCreateHandler extends _createRelated.default {
    getAttributes(model) {
      const attributes = {};
      if (model.get('accountId')) {
        attributes['accountsIds'] = [model.get('accountId')];
      }
      return Promise.resolve(attributes);
    }
  }
  var _default = ContactsCreateHandler;
  _exports.default = _default;
});

define("modules/crm/handlers/knowledge-base-article/send-in-email", ["exports", "handlers/row-action"], function (_exports, _rowAction) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _rowAction = _interopRequireDefault(_rowAction);
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

  class SendInEmailHandler extends _rowAction.default {
    isAvailable(model, action) {
      return this.view.getAcl().checkScope('Email', 'create');
    }
    process(model, action) {
      const parentModel = this.view.getParentView().model;
      const modelFactory = this.view.getModelFactory();
      const collectionFactory = this.view.getCollectionFactory();
      Espo.Ui.notify(' ... ');
      model.fetch().then(() => {
        return new Promise(resolve => {
          if (parentModel.get('contactsIds') && parentModel.get('contactsIds').length) {
            collectionFactory.create('Contact', contactList => {
              const contactListFinal = [];
              contactList.url = 'Case/' + parentModel.id + '/contacts';
              contactList.fetch().then(() => {
                contactList.forEach(contact => {
                  if (contact.id === parentModel.get('contactId')) {
                    contactListFinal.unshift(contact);
                  } else {
                    contactListFinal.push(contact);
                  }
                });
                resolve(contactListFinal);
              });
            });
            return;
          }
          if (parentModel.get('accountId')) {
            modelFactory.create('Account', account => {
              account.id = parentModel.get('accountId');
              account.fetch().then(() => resolve([account]));
            });
            return;
          }
          if (parentModel.get('leadId')) {
            modelFactory.create('Lead', lead => {
              lead.id = parentModel.get('leadId');
              lead.fetch().then(() => resolve([lead]));
            });
            return;
          }
          resolve([]);
        });
      }).then(list => {
        const attributes = {
          parentType: 'Case',
          parentId: parentModel.id,
          parentName: parentModel.get('name'),
          name: '[#' + parentModel.get('number') + ']'
        };
        attributes.to = '';
        attributes.cc = '';
        attributes.nameHash = {};
        list.forEach((model, i) => {
          if (model.get('emailAddress')) {
            if (i === 0) {
              attributes.to += model.get('emailAddress') + ';';
            } else {
              attributes.cc += model.get('emailAddress') + ';';
            }
            attributes.nameHash[model.get('emailAddress')] = model.get('name');
          }
        });
        Espo.loader.require('crm:knowledge-base-helper', Helper => {
          const helper = new Helper(this.view.getLanguage());
          helper.getAttributesForEmail(model, attributes, attributes => {
            const viewName = this.view.getMetadata().get('clientDefs.Email.modalViews.compose') || 'views/modals/compose-email';
            this.view.createView('composeEmail', viewName, {
              attributes: attributes,
              selectTemplateDisabled: true,
              signatureDisabled: true
            }, view => {
              Espo.Ui.notify(false);
              view.render();
              this.view.listenToOnce(view, 'after:send', () => {
                parentModel.trigger('after:relate');
              });
            });
          });
        });
      }).catch(() => {
        Espo.Ui.notify(false);
      });
    }
  }
  var _default = SendInEmailHandler;
  _exports.default = _default;
});

define("modules/crm/handlers/knowledge-base-article/move", ["exports", "handlers/row-action"], function (_exports, _rowAction) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _rowAction = _interopRequireDefault(_rowAction);
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

  class MoveActionHandler extends _rowAction.default {
    isAvailable(model, action) {
      return model.collection && model.collection.orderBy === 'order' && model.collection.order === 'asc';
    }
    process(model, action) {
      if (action === 'moveToTop') {
        this.moveToTop(model);
        return;
      }
      if (action === 'moveToBottom') {
        this.moveToBottom(model);
        return;
      }
      if (action === 'moveUp') {
        this.moveUp(model);
        return;
      }
      if (action === 'moveDown') {
        this.moveDown(model);
      }
    }
    moveToTop(model) {
      const index = this.collection.indexOf(model);
      if (index === 0) {
        return;
      }
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('KnowledgeBaseArticle/action/moveToTop', {
        id: model.id,
        where: this.collection.getWhere()
      }).then(() => {
        this.collection.fetch().then(() => Espo.Ui.notify(false));
      });
    }
    moveUp(model) {
      const index = this.collection.indexOf(model);
      if (index === 0) {
        return;
      }
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('KnowledgeBaseArticle/action/moveUp', {
        id: model.id,
        where: this.collection.getWhere()
      }).then(() => {
        this.collection.fetch().then(() => Espo.Ui.notify(false));
      });
    }
    moveDown(model) {
      const index = this.collection.indexOf(model);
      if (index === this.collection.length - 1 && this.collection.length === this.collection.total) {
        return;
      }
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('KnowledgeBaseArticle/action/moveDown', {
        id: model.id,
        where: this.collection.getWhere()
      }).then(() => {
        this.collection.fetch().then(() => Espo.Ui.notify(false));
      });
    }
    moveToBottom(model) {
      const index = this.collection.indexOf(model);
      if (index === this.collection.length - 1 && this.collection.length === this.collection.total) {
        return;
      }
      Espo.Ui.notify(' ... ');
      Espo.Ajax.postRequest('KnowledgeBaseArticle/action/moveToBottom', {
        id: model.id,
        where: this.collection.getWhere()
      }).then(() => {
        this.collection.fetch().then(() => Espo.Ui.notify(false));
      });
    }
  }
  var _default = MoveActionHandler;
  _exports.default = _default;
});

define("modules/crm/handlers/case/detail-actions", ["exports", "action-handler"], function (_exports, _actionHandler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _actionHandler = _interopRequireDefault(_actionHandler);
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

  class CaseDetailActionHandler extends _actionHandler.default {
    close() {
      const model = this.view.model;
      model.save({
        status: 'Closed'
      }, {
        patch: true
      }).then(() => {
        Espo.Ui.success(this.view.translate('Closed', 'labels', 'Case'));
      });
    }
    reject() {
      const model = this.view.model;
      model.save({
        status: 'Rejected'
      }, {
        patch: true
      }).then(() => {
        Espo.Ui.success(this.view.translate('Rejected', 'labels', 'Case'));
      });
    }

    // noinspection JSUnusedGlobalSymbols
    isCloseAvailable() {
      return this.isStatusAvailable('Closed');
    }

    // noinspection JSUnusedGlobalSymbols
    isRejectAvailable() {
      return this.isStatusAvailable('Rejected');
    }
    isStatusAvailable(status) {
      const model = this.view.model;
      const acl = this.view.getAcl();
      const metadata = this.view.getMetadata();

      /** @type {string[]} */
      const notActualStatuses = metadata.get('entityDefs.Case.fields.status.notActualOptions') || [];
      if (notActualStatuses.includes(model.get('status'))) {
        return false;
      }
      if (!acl.check(model, 'edit')) {
        return false;
      }
      if (!acl.checkField(model.entityType, 'status', 'edit')) {
        return false;
      }
      const statusList = metadata.get(['entityDefs', 'Case', 'fields', 'status', 'options']) || [];
      if (!statusList.includes(status)) {
        return false;
      }
      return true;
    }
  }
  var _default = CaseDetailActionHandler;
  _exports.default = _default;
});

define("modules/crm/handlers/campaign/mass-emails-create", ["exports", "handlers/create-related"], function (_exports, _createRelated) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _createRelated = _interopRequireDefault(_createRelated);
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

  class MassEmailsCreateHandler extends _createRelated.default {
    getAttributes(model) {
      return Promise.resolve({
        name: model.get('name') + ' ' + this.viewHelper.dateTime.getToday()
      });
    }
  }
  var _default = MassEmailsCreateHandler;
  _exports.default = _default;
});

define("modules/crm/controllers/unsubscribe", ["exports", "controller"], function (_exports, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
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

  class UnsubscribeController extends _controller.default {
    // noinspection JSUnusedGlobalSymbols
    actionUnsubscribe(data) {
      const viewName = data.view || 'crm:views/campaign/unsubscribe';
      this.entire(viewName, {
        actionData: data.actionData,
        template: data.template
      }, view => {
        view.render();
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionSubscribeAgain(data) {
      const viewName = data.view || 'crm:views/campaign/subscribe-again';
      this.entire(viewName, {
        actionData: data.actionData,
        template: data.template
      }, view => {
        view.render();
      });
    }
  }
  var _default = UnsubscribeController;
  _exports.default = _default;
});

define("modules/crm/controllers/tracking-url", ["exports", "controller"], function (_exports, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
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

  class TrackingUrlController extends _controller.default {
    // noinspection JSUnusedGlobalSymbols
    actionDisplayMessage(data) {
      const viewName = data.view || 'crm:views/campaign/tracking-url';
      this.entire(viewName, {
        message: data.message,
        template: data.template
      }, view => {
        view.render();
      });
    }
  }
  var _default = TrackingUrlController;
  _exports.default = _default;
});

define("modules/crm/controllers/lead", ["exports", "controllers/record"], function (_exports, _record) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _record = _interopRequireDefault(_record);
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

  class LeadController extends _record.default {
    // noinspection JSUnusedGlobalSymbols
    actionConvert(id) {
      this.main('crm:views/lead/convert', {
        id: id
      });
    }
  }
  var _default = LeadController;
  _exports.default = _default;
});

define("modules/crm/controllers/event-confirmation", ["exports", "controller"], function (_exports, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
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

  class EventConfirmationController extends _controller.default {
    // noinspection JSUnusedGlobalSymbols
    actionConfirmEvent(actionData) {
      const viewName = this.getMetadata().get(['clientDefs', 'EventConfirmation', 'confirmationView']) || 'crm:views/event-confirmation/confirmation';
      this.entire(viewName, {
        actionData: actionData
      }, view => {
        view.render();
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = EventConfirmationController;
  _exports.default = _default;
});

define("modules/crm/controllers/calendar", ["exports", "controller"], function (_exports, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
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

  class CalendarController extends _controller.default {
    checkAccess() {
      if (this.getAcl().check('Calendar')) {
        return true;
      }
      return false;
    }

    // noinspection JSUnusedGlobalSymbols
    actionShow(options) {
      this.actionIndex(options);
    }
    actionIndex(options) {
      this.handleCheckAccess('');
      this.main('crm:views/calendar/calendar-page', {
        date: options.date,
        mode: options.mode,
        userId: options.userId,
        userName: options.userName
      });
    }
  }
  var _default = CalendarController;
  _exports.default = _default;
});

define("modules/crm/controllers/activities", ["exports", "controller"], function (_exports, _controller) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _controller = _interopRequireDefault(_controller);
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

  class ActivitiesController extends _controller.default {
    checkAccess(action) {
      if (this.getAcl().check('Activities')) {
        return true;
      }
      return false;
    }

    // noinspection JSUnusedGlobalSymbols
    actionActivities(options) {
      this.processList('activities', options.entityType, options.id, options.targetEntityType);
    }
    actionHistory(options) {
      this.processList('history', options.entityType, options.id, options.targetEntityType);
    }

    /**
     * @param {'activities'|'history'} type
     * @param {string} entityType
     * @param {string} id
     * @param {string} targetEntityType
     */
    processList(type, entityType, id, targetEntityType) {
      let viewName = 'crm:views/activities/list';
      let model;
      this.modelFactory.create(entityType).then(m => {
        model = m;
        model.id = id;
        return model.fetch({
          main: true
        });
      }).then(() => {
        return this.collectionFactory.create(targetEntityType);
      }).then(collection => {
        collection.url = 'Activities/' + model.entityType + '/' + id + '/' + type + '/list/' + targetEntityType;
        this.main(viewName, {
          scope: entityType,
          model: model,
          collection: collection,
          link: type + '_' + targetEntityType,
          type: type
        });
      });
    }
  }
  var _default = ActivitiesController;
  _exports.default = _default;
});

define("modules/crm/acl-portal/document", ["exports", "acl-portal"], function (_exports, _aclPortal) {
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

  class DocumentAclPortal extends _aclPortal.default {
    // noinspection JSUnusedGlobalSymbols
    checkModelEdit(model, data, precise) {
      let result = this.checkModel(model, data, 'delete', precise);
      if (result) {
        return true;
      }
      if (data.edit === 'account') {
        return true;
      }
      return false;
    }
  }
  var _default = DocumentAclPortal;
  _exports.default = _default;
});

define("modules/crm/acl-portal/contact", ["exports", "acl-portal"], function (_exports, _aclPortal) {
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

  class ContactAclPortal extends _aclPortal.default {
    checkIsOwnContact(model) {
      const contactId = this.getUser().get('contactId');
      if (!contactId) {
        return false;
      }
      if (contactId === model.id) {
        return true;
      }
      return false;
    }
  }
  var _default = ContactAclPortal;
  _exports.default = _default;
});

define("modules/crm/acl-portal/account", ["exports", "acl-portal"], function (_exports, _aclPortal) {
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

  class AccountAclPortal extends _aclPortal.default {
    checkInAccount(model) {
      const accountIdList = this.getUser().getLinkMultipleIdList('accounts');
      if (!accountIdList.length) {
        return false;
      }
      if (~accountIdList.indexOf(model.id)) {
        return true;
      }
      return false;
    }
  }
  var _default = AccountAclPortal;
  _exports.default = _default;
});

define("modules/crm/acl/mass-email", ["exports", "acl"], function (_exports, _acl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _acl = _interopRequireDefault(_acl);
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

  class MassEmailAcl extends _acl.default {
    checkIsOwner(model) {
      if (model.has('campaignId')) {
        return true;
      }
      return super.checkIsOwner(model);
    }
    checkInTeam(model) {
      if (model.has('campaignId')) {
        return true;
      }
      return super.checkInTeam(model);
    }
  }
  var _default = MassEmailAcl;
  _exports.default = _default;
});

define("modules/crm/acl/campaign-tracking-url", ["exports", "acl"], function (_exports, _acl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _acl = _interopRequireDefault(_acl);
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

  class CampaignTrackingUrlAcl extends _acl.default {
    checkIsOwner(model) {
      if (model.has('campaignId')) {
        return true;
      }
      return false;
    }
    checkInTeam(model) {
      if (model.has('campaignId')) {
        return true;
      }
      return false;
    }
  }
  var _default = CampaignTrackingUrlAcl;
  _exports.default = _default;
});

define("modules/crm/acl/call", ["exports", "modules/crm/acl/meeting"], function (_exports, _meeting) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _meeting = _interopRequireDefault(_meeting);
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

  class CallAcl extends _meeting.default {}
  var _default = CallAcl;
  _exports.default = _default;
});

