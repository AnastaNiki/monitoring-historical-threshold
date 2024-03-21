<script setup>

import { reactive, computed, watch } from "vue";

//использование плагинов
import { useQuasar, useDialogPluginComponent, Notify, date } from "quasar";
import { ref } from 'vue'

//клиент Apollo вариант 1
import {apolloClient} from 'boot/apollo'
//клиент Apollo вариант 2
import { useQuery } from '@vue/apollo-composable'

//подключаем диалог из плагина, будем спрашивать удаление и обновление
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();


//импортируем GraphQL запросы
import {READ_THRESHOLDS_DATA,
        CREATE_THRESHOLD,
        UPDATE_THRESHOLD,
        DELETE_THRESHOLD,} from '../queries/Threshold.js'

import {CREATE_METRIC,
        UPDATE_METRIC,
        DELETE_METRIC,} from '../queries/Metric.js'

import {CREATE_ROLE,
        UPDATE_ROLE,
        DELETE_ROLE,} from '../queries/Role.js'

import {CREATE_RESOURCE,
        UPDATE_RESOURCE,
        DELETE_RESOURCE,} from '../queries/Resource.js'

const levelOptions = ['WARN', 'CRIT']; //TOdo: зарпашивать с бэкенда опции

//глобальная переменная на простраство квазар c разными параметрами
const $q = useQuasar();

//объект состояния приложения
const state = reactive({
  loading: false, //статус активного запроса
  filter: "", //строка фильтра
  formTitle: "", //заголовок формы редактирования и обновления,
  action: "",
  inputThreshold: {
    //объект ввода данных
    id: "",
    name: "",
    objectKind: "",
    level: "",
    values: {createdAt:"", value:""},
    metric: {id:"", name:""},
    role: {id:"", name:""},
    resource: {id:"", name:"", roleId:""},
    newValue: "",
  },
  inputMetric: {
    id: "",
    name: "",
  },
  inputRole: {
    id: "",
    name: "",
  },
  inputResource: {
    id: "",
    name: "",
    roleId: "",
    role: { name: "", id: ""},
  },

  //для фильтров и отображения значений
  metrics:[{
    id:"",
    label:"",
  }],
  roles:[{
    id:"",
    label:"",
  }],
  resources:[{
    id:"",
    label:"",
    roleId:"",
  }]
});

const tab = ref('Thresholds')

//опции при создании нового порога
const metricOptions = ref(state.metrics)
const roleOptions = ref(state.roles)

// после установки роли, передаются ресурсы для этой роли
const resourceOptions = ref(state.resources)

//для проверки корректности данных при создании
const inputMetricValid = ref(null)
const inputRoleValid = ref(null)
const inputLevelValid = ref(null)
const inputValueValid = ref(null)
const inputResourceValid = ref(null)


function filterMetric (val, update) {
        if (val === '') {
          update(() => {
            metricOptions.value = state.metrics
          })
          return
        }

        update(() => {
          //needle - значение фильтра
          const needle = val.toLowerCase()
          metricOptions.value = state.metrics.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
        })
};

function filterRole (val, update) {
    state.inputThreshold.resource = ""
        if (val === '') {
          update(() => {
            roleOptions.value = state.roles
          })
          return
        }

        update(() => {
          //needle - значение фильтра
          const needle = val.toLowerCase()
          roleOptions.value = state.roles.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
          // resourceOptions.value = state.resources.filter(v => v.roleId.toLowerCase().indexOf(state.inputThreshold.role.id) > -1)
        })
};

function filterResource (val, update) {
        if (val === '') {
          update(() => {
            if (state.inputThreshold.role == null) {
              resourceOptions.value = state.resources.filter(v => v.roleId?.toLowerCase().indexOf("notExist") > -1)
              return
            }
            resourceOptions.value = state.resources.filter(v => v.roleId?.toLowerCase().indexOf(state.inputThreshold.role.id) > -1)
          })
          return
        }

        update(() => {
          //needle - значение фильтра
          const needle = val.toLowerCase()
          if (state.inputThreshold.role) {
            resourceOptions.value = state.resources.filter(v => v.roleId.toLowerCase().indexOf(state.inputThreshold.role.id) > -1)
          }
          resourceOptions.value = state.resources.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
        })
};



//описание столбцов таблицы

const columnStyle = "width: 20%; font-size: 14px; font-family:  Roboto,-apple-system,Helvetica Neue,Helvetica,Arial,sans-serif;";

const columnsThreshold = [
  {
    align: "left",
    field: row => row.metric.name + row.metric.id,
    label: "Метрика",
    name: "metric",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
  {
    align: "left",
    field: row => row.role.name + row.resource?.name + row.resource?.id + row.id,
    label: "Ресурс. Роль",
    name: "resource.role",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
  {
    align: "right",
    field: "level",
    label: "Уровень",
    name: "level",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
  {
    align: "right",
    field: row => row.values[row.values.length - 1].value,
    label: "Значение",
    name: "value",
    style: columnStyle,
    headerStyle: "font-weight: bold",
  },
];

const columnsValue = [
  {
    align: "left",
    field: row => date.formatDate(row.createdAt, 'DD.MM.YYYY HH:mm:ss'),
    label: "Дата обновления",
    name: "createdAt",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
  {
    align: "left",
    field: "value",
    label: "Значение",
    name: "value",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
];

const columnsMetric = [
  {
    align: "left",
    field: row => row.name + row.id,
    label: "Название метрики",
    name: "nameMetric",
    style: "width: 20%; font-size: 14px;",
    sortable: true,
    headerStyle: "font-weight: bold",
  },
];

const columnsRole = [
  {
    align: "left",
    field: row => row.name + row.id,
    label: "Название роли",
    name: "nameRole",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
];

const columnsResource = [
  {
    align: "left",
    field: row => row.name + row.id,
    label: "Название ресурса",
    name: "name",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
  {
    align: "left",
    field:  row => row.role.name + row.role.id,
    label: "Название роли",
    name: "roleName",
    style: columnStyle,
    sortable: true,
    headerStyle: "font-weight: bold",
  },
];


//читаем данные, запрос на бэкенд
//const { result, loading, subscribeToMore} = useQuery(READ_THRESHOLDS_DATA);
//todo: можно добавить subscribeToMore, затем убрать работу с кэшем
const { result, loading} = useQuery(READ_THRESHOLDS_DATA);
const thresholds = computed(() => result.value ?? []);
console.log(thresholds);


//обновляем статус загрузки
watch(loading,(value) => {
  state.loading=value
})

//запрос к бэкенду через Apollo клиент

const deleteThreshold = async (id) => {
    apolloClient
        .mutate({
            mutation: DELETE_THRESHOLD,
            variables: {removeThresholdId: id}
            })
        .then((response) =>
              $q.notify({
              message: `Порог для ${response.data?.removeThreshold.metric.name}:
                ${response.data?.removeThreshold.role.name}
                ${response.data?.removeThreshold.resource?.name ?? ''}  удалён!`,
              color: 'positive',
              icon: 'done'
              })
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const deleteMetric = async (id) => {
    apolloClient
        .mutate({
            mutation: DELETE_METRIC,
            variables: {removeMetricId: id},
            update(cache) {
              const normalizedId = cache.identify({ id, __typename: 'Metric' });
              cache.evict({ id: normalizedId });
              cache.gc();
            }
          })
        .then((response) => {
              $q.notify({
              message: `Метрика ${response.data?.removeMetric.name}  удалена!`,
              color: 'positive',
              icon: 'done'
              })
        }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const deleteRole = async (id) => {
    apolloClient
        .mutate({
            mutation: DELETE_ROLE,
            variables: {removeRoleId: id},
            update(cache) {
              const normalizedId = cache.identify({ id, __typename: 'Role' });
              cache.evict({ id: normalizedId });
              cache.gc();
            }
          })
        .then((response) => {
              $q.notify({
              message: `Роль ${response.data?.removeRole.name} удалена!`,
              color: 'positive',
              icon: 'done'
              })
        }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const deleteResource = async (id) => {
    apolloClient
        .mutate({
            mutation: DELETE_RESOURCE,
            variables: {removeResourceId: id},
            update(cache) {
              const normalizedId = cache.identify({ id, __typename: 'Resource' });
              cache.evict({ id: normalizedId });
              cache.gc();
            }
          })
        .then((response) => {
              $q.notify({
              message: `Ресурс ${response.data?.removeResource.name} удалён!`,
              color: 'positive',
              icon: 'done'
              })
        }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

function deleteRow(id) {
  $q.dialog({
      title:'Удаление записи',
      message: 'Уверены, что хотите удалить запись?',
      focus: 'cancel',
      ok:{
        label:'Да',
        color:'positive'
      },
      cancel:{
        label:'Нет',
        color:'negative'
      },
      persistent: true //выключить закрытие диалога по esc
    }).onOk(() => {
        if (state.action === 'deleteThreshold') {
          return deleteThreshold(id);
        }
        if (state.action === 'deleteMetric') {
          return deleteMetric(id);
        }
        if (state.action === 'deleteRole') {
          return deleteRole(id);
        }
        if (state.action === 'deleteResource') {
          return deleteResource(id);
        }
      })
}


const createThreshold = async (variable) => {
  console.log(state.inputThreshold)
    apolloClient
        .mutate({
            mutation: CREATE_THRESHOLD,
            variables: { createThresholdInput: {
                          metricId: variable.input.metric.id,
                          objectKind: variable.input.objectKind,
                          roleId: variable.input.role.id,
                          resourceId: variable.input.resource.id,
                          level: variable.input.level,
                          value: Number(variable.input.newValue)
                        }
            },
            update: (cache, {data:{createThreshold } }) => {
              var checkExist = thresholds.value.readThresholds.filter(v => v.id.indexOf(createThreshold.id) > -1)
              if (!checkExist.length) {
                const data = cache.readQuery({query:READ_THRESHOLDS_DATA})
                cache.writeQuery({query:READ_THRESHOLDS_DATA,
                data:{
                  readThresholds:[...data.readThresholds,createThreshold],
                  readMetrics:[...data.readMetrics],
                  readResources:[...data.readResources],
                  readRoles:[...data.readRoles]
                }})
              }
            }
            })
        .then((response) =>{
              $q.notify({
              message: `Порог ${response.data?.createThreshold.metric.name}:
                ${response.data?.createThreshold.role.name}
                ${response.data?.createThreshold.resource?.name ?? ''} добавлен!`,
              color: 'positive',
              icon: 'done'
              })
              state.filter = response.data?.createThreshold.id
              // if (response.data?.createThreshold.resource?.name) {
              //   state.filter = response.data?.createThreshold.resource?.name;
              // } else
              //   state.filter = response.data?.createThreshold.role?.name;
              onDialogOK();
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
};

const createMetric = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: CREATE_METRIC,
            variables: { createMetricInput: {
                          name: variable.input.name,
                        }
            },
            update: (cache, {data:{createMetric } }) => {
              const data = cache.readQuery({query:READ_THRESHOLDS_DATA})

              cache.writeQuery({query:READ_THRESHOLDS_DATA,
              data:{
                readMetrics:[...data.readMetrics,createMetric],
                readThresholds:[...data.readThresholds],
                readResources:[...data.readResources],
                readRoles:[...data.readRoles]
              }})
            }
            })
        .then((response) =>{
              $q.notify({
              message: `Метрика ${response.data?.createMetric.name} добавлена!`,
              color: 'positive',
              icon: 'done'
              })
              if (state.action === 'createMetric') {
                state.filter = response.data?.createMetric.id;
              }
              onDialogOK();
              if (state.action === 'addMetricThreshold') {
                // state.inputThreshold.metric = response.data?.createMetric
                addThreshold();
              }
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
};

const createRole = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: CREATE_ROLE,
            variables: { createRoleInput: {
                          name: variable.input.name,
                        }
            },
            update: (cache, {data:{createRole } }) => {
              const data = cache.readQuery({query:READ_THRESHOLDS_DATA})

              cache.writeQuery({query:READ_THRESHOLDS_DATA,
              data:{
                readMetrics:[...data.readMetrics],
                readThresholds:[...data.readThresholds],
                readResources:[...data.readResources],
                readRoles:[...data.readRoles, createRole]
              }})
            }
            })
        .then((response) =>{
              $q.notify({
              message: `Роль ${response.data?.createRole.name} добавлена!`,
              color: 'positive',
              icon: 'done'
              })
              if (state.action === 'createRole') {
                state.filter = response.data?.createRole.id;
              }
              onDialogOK();
              if (state.action === 'addRoleThreshold') {
                // state.inputThreshold.metric = response.data?.createRole
                addThreshold();
              }
              if (state.action === 'addRoleResource') {
                // state.inputThreshold.metric = response.data?.createRole
                state.action = 'createResource'
                addResource();
              }
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
};

const createResource = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: CREATE_RESOURCE,
            variables: { createResourceInput: {
                          name: variable.input.name,
                          roleId: variable.input.role.id
                        }
            },
            update: (cache, {data:{createResource } }) => {
              const data = cache.readQuery({query:READ_THRESHOLDS_DATA})

              cache.writeQuery({query:READ_THRESHOLDS_DATA,
              data:{
                readMetrics:[...data.readMetrics],
                readThresholds:[...data.readThresholds],
                readResources:[...data.readResources, createResource],
                readRoles:[...data.readRoles]
              }})
            }
            })
        .then((response) =>{
              $q.notify({
              message: `Ресурс ${response.data?.createResource.name} добавлен!`,
              color: 'positive',
              icon: 'done'
              })
              if (state.action === 'createResource') {
                state.filter = response.data?.createResource.id;
              }
              onDialogOK();
              if (state.action === 'addResourceThreshold') {
                state.inputThreshold.resource = response.data?.createResource
                addThreshold();
              }
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
};

//обновление записи
//variable - входящий параметр
const updateThreshold = async (variable) => {
    apolloClient
        .mutate({
            mutation: UPDATE_THRESHOLD,
            variables: {
              updateThresholdInput: {
                id: variable.input.id,
                value: Number(variable.input.newValue),
            }
              },
            })
        .then((response) =>{
              $q.notify({
              message: `Значение для ${response.data?.updateThreshold.metric.name}:
                ${response.data?.updateThreshold.role.name}
                ${response.data?.updateThreshold.resource?.name ?? ''} обновлено!`,
              color: 'positive',
              icon: 'done'
              });
              state.filter = response.data?.updateThreshold.id
              // if (response.data?.updateThreshold.resource?.name) {
              //   state.filter = response.data?.updateThreshold.resource?.name;
              // } else
              //   state.filter = response.data?.updateThreshold.role?.name;
              onDialogOK();
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const updateMetric = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: UPDATE_METRIC,
            variables: {
              updateMetricInput: {
                id: variable.input.id,
                name: variable.input.name,
            }
              },
            })
        .then((response) =>{
              $q.notify({
              message: `Название метрики ${response.data?.updateMetric.name} обновлено!`,
              color: 'positive',
              icon: 'done'
              });
              state.filter = response.data?.updateMetric.id
              // if (response.data?.updateThreshold.resource?.name) {
              //   state.filter = response.data?.updateThreshold.resource?.name;
              // } else
              //   state.filter = response.data?.updateThreshold.role?.name;
              onDialogOK();
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const updateRole = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: UPDATE_ROLE,
            variables: {
              updateRoleInput: {
                id: variable.input.id,
                name: variable.input.name,
            }
              },
            })
        .then((response) =>{
              $q.notify({
              message: `Название роли ${response.data?.updateRole.name} обновлено!`,
              color: 'positive',
              icon: 'done'
              });
              state.filter = response.data?.updateRole.id
              // if (response.data?.updateThreshold.resource?.name) {
              //   state.filter = response.data?.updateThreshold.resource?.name;
              // } else
              //   state.filter = response.data?.updateThreshold.role?.name;
              onDialogOK();
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

const updateResource = async (variable) => {
  console.log(variable)
    apolloClient
        .mutate({
            mutation: UPDATE_RESOURCE,
            variables: {
              updateResourceInput: {
                id: variable.input.id,
                name: variable.input.name,
            }
              },
            })
        .then((response) =>{
              $q.notify({
              message: `Название ресурса ${response.data?.updateResource.name} обновлено!`,
              color: 'positive',
              icon: 'done'
              });
              state.filter = response.data?.updateResource.id
              // if (response.data?.updateThreshold.resource?.name) {
              //   state.filter = response.data?.updateThreshold.resource?.name;
              // } else
              //   state.filter = response.data?.updateThreshold.role?.name;
              onDialogOK();
            }
        )
        .catch(error => {
              $q.notify({
              message: error.message,
              color: 'negative',
              icon: 'error'
            })
          });
}

function addThreshold(){
  //обнуляем данные редактирования, если новая запись
  if (state.action !== 'addMetricThreshold') {
    resetThreshold()
  }
  setThresholdCreateOptions();
  //меняем заголовок диалога
  state.formTitle = 'Добавить порог'
  state.action = 'createThreshold'
  dialogRef.value.show()
};

function addMetric(){
  //обнуляем данные редактирования, у нас новая запись
  resetMetric()
  // меняем заголовок диалога
  state.formTitle = 'Добавить метрику'
  dialogRef.value.show()
};

function addRole(){
  //обнуляем данные редактирования, у нас новая запись
  resetRole()
  // меняем заголовок диалога
  state.formTitle = 'Добавить роль'
  dialogRef.value.show()
};

function addResource(){
  //обнуляем данные редактирования, у нас новая запись
  resetResource()
  setResourceCreateOptions();
  //меняем заголовок диалога
  state.formTitle = 'Добавить ресурс'
  dialogRef.value.show()
};

function editThreshold(e, row){
  e.stopPropagation()//останавливаем клик
  //передаем в объект редактирования запись из таблицы
  state.inputThreshold=Object.assign({}, row, {newValue:""});
  //удаляем лишнее поле, которое служебное, но не описано в типе ввода input
  delete state.inputThreshold.__typename
  //меняем заголовок диалога
  state.formTitle = 'Обновить порог'
  dialogRef.value.show()
};

function editMetric(e, row){
  e.stopPropagation()//останавливаем клик
  //передаем в объект редактирования запись из таблицы
  state.inputMetric=Object.assign({}, row);
  //удаляем лишнее поле, которое служебное, но не описано в типе ввода input
  delete state.inputMetric.__typename
  //меняем заголовок диалога
  state.formTitle = 'Обновить метрику'
  dialogRef.value.show()
};

function editRole(e, row){
  e.stopPropagation()//останавливаем клик
  //передаем в объект редактирования запись из таблицы
  state.inputRole=Object.assign({}, row);
  //удаляем лишнее поле, которое служебное, но не описано в типе ввода input
  delete state.inputRole.__typename
  //меняем заголовок диалога
  state.formTitle = 'Обновить роль'
  dialogRef.value.show()
};

function editResource(e, row){
  e.stopPropagation()//останавливаем клик
  //передаем в объект редактирования запись из таблицы
  state.inputResource=Object.assign({}, row);
  //удаляем лишнее поле, которое служебное, но не описано в типе ввода input
  delete state.inputResource.__typename
  //меняем заголовок диалога
  state.formTitle = 'Обновить ресурс'
  dialogRef.value.show()
};

//заполняем объекты для создания threshold (выбор значений в диалоге)
function setThresholdCreateOptions() {
  state.metrics = []
  for (var key in thresholds.value.readMetrics) {
      state.metrics.push({label:thresholds.value.readMetrics[key].name,
        id:thresholds.value.readMetrics[key].id})
  }
  state.roles = []
  for (var key in thresholds.value.readRoles) {
      state.roles.push({label:thresholds.value.readRoles[key].name,
        id:thresholds.value.readRoles[key].id})
  }
  state.resources = []
  for (var key in thresholds.value.readResources) {
      state.resources.push({label:thresholds.value.readResources[key].name,
        id:thresholds.value.readResources[key].id,
        roleId:thresholds.value.readResources[key].roleId})
  }
};

function setResourceCreateOptions() {
  state.roles = []
  for (var key in thresholds.value.readRoles) {
      state.roles.push({label:thresholds.value.readRoles[key].name,
        id:thresholds.value.readRoles[key].id})
  }
};

//обнуляем состояние input
function resetThreshold() {
  for (var key in state.inputThreshold) {
    // затираем объект редактирования, перебирая все элементы
      state.inputThreshold[key]=""
    }
};

function resetMetric() {
  for (var key in state.inputMetric) {
      state.inputMetric[key]=""
    }
};

function resetRole() {
  for (var key in state.inputRole) {
      state.inputRole[key]=""
    }
};

function resetResource() {
  for (var key in state.inputResource) {
      state.inputResource[key]=""
    }
};

//обработка события на диалоге редактирования
const handleClickOk = () => {
  console.log(state.action)
  if (state.action === 'createThreshold') {
      if (!state.inputThreshold.resource) {
        state.inputThreshold.objectKind = "ROLE"
      } else {
        state.inputThreshold.objectKind = "RESOURCE"
      }
      if ( inputMetricValid.value.validate() &&
          inputRoleValid.value.validate() &&
          inputLevelValid.value.validate() &&
          inputValueValid.value.validate()) {

        createThreshold({ input:state.inputThreshold });
      }
  }
  if (state.action === 'updateThreshold' && inputValueValid.value.validate()) {
      updateThreshold({ input:state.inputThreshold });
  }

  if (state.action === 'createMetric' || state.action === 'addMetricThreshold') {
    if (state.inputMetric.id === '' && inputMetricValid.value.validate()) {
      createMetric({ input:state.inputMetric });
    }
  }

  if (state.action === 'updateMetric' && state.inputMetric.id !== '' && inputMetricValid.value.validate()) {
      updateMetric({ input:state.inputMetric })
  }

  if (state.action === 'createRole' || state.action === 'addRoleThreshold' || state.action === 'addRoleResource') {
    if (state.inputRole.id === '' && inputRoleValid.value.validate()) {
      createRole({ input:state.inputRole });
    }
  }

  if (state.action === 'updateRole' && state.inputRole.id !== '' && inputRoleValid.value.validate()) {
      updateRole({ input:state.inputRole })
  }

  if (state.action === 'createResource' || state.action === 'addResourceThreshold' ) {
    if (state.inputResource.id === '' && inputResourceValid.value.validate() && inputRoleValid.value.validate()) {
      createResource({ input:state.inputResource });
    }
  }

  if (state.action === 'updateResource' && state.inputResource.id !== '' && inputResourceValid.value.validate()) {
      updateResource({ input:state.inputResource })
  }
};

const handleClickCancel = () => {
      onDialogCancel();
      // создание уведомления через экземпляр класса
      Notify.create({
              message: 'Запись не сохранена!',
              color: 'negative',
              icon: 'done'
            })
};


</script>

<template>

  <q-page  >

    <q-tabs align="left"
        v-model="tab"
        class="text-teal"
      >
      <q-tab  name="Thresholds" label="Пороги" />
      <q-tab  name="Metrics"  label="Метрики" />
      <q-tab  name="Roles"  label="Роли" />
      <q-tab  name="Resources"  label="Ресурсы" />

    </q-tabs>
    <!-- <q-separator /> -->

    <q-tab-panels
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
      <q-tab-panel name="Thresholds">
      <q-table key="thresholdTable"
        :columns="columnsThreshold"
        :loading="state.loading"
        :rows="thresholds.readThresholds"
        :filter="state.filter"
        :pagination="{
          sortBy:'metric',
          rowsPerPage: 20
        }"
        no-data-label="Нет данных"
        no-results-label="Ничего не найдено"
        style="height: 83vh; width: 98%; margin: auto;"
      >
        <!--кастомный заголовок таблицы, чтобы вставить поле поиска-->

        <template v-slot:top>
          <q-toolbar-title >
            Пороги
          </q-toolbar-title>

          <q-input  dense debounce="300" color="primary" v-model="state.filter" :clearable="true" style="width: 50vh">
          <template v-slot:append >
              <q-icon name="search"></q-icon>
          </template>
          </q-input>
            <q-space />
            <q-btn
              color="green"
              icon="add"
              label="Добавить порог"
              @click="addThreshold()"
          />
        </template>

        <template v-slot:body="props" >
          <q-tr :props="props" @click="props.expand = !props.expand" >
            <q-td key="metric" :props="props">
              {{ props.row.metric.name }}
            </q-td>
            <q-td key="resource.role" :props="props" >
              {{ props.row.resource?.name }}
              <br/>
              <span style="color: gray">{{ props.row.role.name }}</span>
            </q-td>
            <q-td key="level" :props="props">
              {{ props.row.level}}
            </q-td>
            <q-td key="value" :props="props">
              {{ props.row.values[props.row.values.length - 1].value}}
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="row">
                <div class="column col-10">
                  <p class="text-left"></p>
                  <q-table align="right"
                  :columns="columnsValue"
                  :loading="state.loading"
                  :rows=props.row.values
                  no-data-label="Нет данных"
                  no-results-label="Ничего не найдено"
                  style="height: 30vh; width: 50%; margin: auto; "
                  :pagination="{
                  sortBy:'createdAt',
                  descending: true,
                  rowsPerPage: 20
                  }"
                > </q-table>
                </div>
                <div class="column col-1">
                  <q-btn
                    size="sm"
                    rounded
                    flat
                    color="primary"
                    icon="update"
                    label="Обновить"
                    @click="(event) => { state.action = 'updateThreshold'; return editThreshold(event, props.row)}"
                  />
                </div>
                <div class="column col-1">
                  <q-btn
                    size="sm"
                    rounded
                    flat
                    color="negative"
                    icon="delete"
                    label="Удалить"
                    @click=" () => {state.action = 'deleteThreshold'; deleteRow(props.row.id)}"
                  />
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      </q-tab-panel>

      <q-tab-panel name="Metrics">
        <q-table key="metricsTable"
          :columns="columnsMetric"
          :loading="state.loading"
          :filter="state.filter"
          :rows="thresholds.readMetrics"
          :pagination="{
            sortBy:'name',
            rowsPerPage: 20
          }"
          no-data-label="Нет данных"
          no-results-label="Ничего не найдено"
          style="height: 83vh; width: 98%; margin: auto; font-size: 14px;
          "
          >
          <template v-slot:top>
            <q-toolbar-title >
              Метрики
            </q-toolbar-title>

            <q-input  dense debounce="300" color="primary" v-model="state.filter" :clearable="true" style="width: 50vh">
            <template v-slot:append >
                <q-icon name="search"></q-icon>
            </template>
            </q-input>
              <q-space />
              <q-btn
                color="green"
                icon="add"
                label="Добавить метрику"
                @click="() => { state.action = 'createMetric'; return addMetric()}"
              />
          </template>
          <template v-slot:body="props" >
            <q-tr :props="props" @click="props.expand = !props.expand" >
              <q-td key="nameMetric" :props="props">
                {{ props.row.name }}
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="primary"
                      icon="update"
                      label="Обновить"
                      @click="(event) => { state.action = 'updateMetric'; return editMetric(event, props.row)}"
                    />
                  </div>
                  <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="negative"
                      icon="delete"
                      label="Удалить"
                      @click=" () => { state.action = 'deleteMetric'; return deleteRow(props.row.id)}"
                    />
                  </div>
            </q-tr>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="Roles">
      <q-table
          :columns="columnsRole"
          :loading="state.loading"
          :filter="state.filter"
          :rows="thresholds.readRoles"
          :pagination="{
            sortBy:'name',
            rowsPerPage: 20
          }"
          no-data-label="Нет данных"
          no-results-label="Ничего не найдено"
          style="height: 83vh; width: 98%; margin: auto;"
          >
          <template v-slot:top>
            <q-toolbar-title >
              Роли
            </q-toolbar-title>

            <q-input dense debounce="300" color="primary" v-model="state.filter" :clearable="true" style="width: 50vh">
            <template v-slot:append >
                <q-icon name="search"></q-icon>
            </template>
            </q-input>
              <q-space />
              <q-btn
                color="green"
                icon="add"
                label="Добавить Роль"
                @click="() => { state.action = 'createRole'; return addRole()}"
            />
          </template>

          <template v-slot:body="props" >
            <q-tr :props="props" @click="props.expand = !props.expand" >
              <q-td key="nameRole" :props="props">
                {{ props.row.name }}
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="primary"
                      icon="update"
                      label="Обновить"
                      @click="(event) => { state.action = 'updateRole'; return editRole(event, props.row)}"
                    />
                  </div>
                  <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="negative"
                      icon="delete"
                      label="Удалить"
                      @click=" () => { state.action = 'deleteRole'; return deleteRow(props.row.id)}"
                    />
                  </div>
            </q-tr>
          </template>
      </q-table>
      </q-tab-panel>

      <q-tab-panel name="Resources">
      <q-table
          :columns="columnsResource"
          :loading="state.loading"
          :filter="state.filter"
          :rows="thresholds.readResources"
          :pagination="{
            sortBy:'name',
            rowsPerPage: 20
          }"
          no-data-label="Нет данных"
          no-results-label="Ничего не найдено"
          style="height: 83vh; width: 98%; margin: auto;"
          >
          <template v-slot:top>
            <q-toolbar-title >
              Ресурсы
            </q-toolbar-title>

            <q-input  dense debounce="300" color="primary" v-model="state.filter" :clearable="true" style="width: 50vh">
            <template v-slot:append >
                <q-icon name="search"></q-icon>
            </template>
            </q-input>
              <q-space />
              <q-btn
                color="green"
                icon="add"
                label="Добавить ресурс"
                @click="() => { state.action = 'createResource'; return addResource()}"
            />
          </template>
          <template v-slot:body="props" >
            <q-tr :props="props" @click="props.expand = !props.expand" >
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="roleName" :props="props">
                  {{ props.row.role.name }}
                </q-td>
              </q-tr>
              <q-tr v-show="props.expand" :props="props">
              <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="primary"
                      icon="update"
                      label="Обновить"
                      @click="(event) => { state.action = 'updateResource'; return editResource(event, props.row)}"
                    />
                  </div>
                  <div class="column col-1">
                    <q-btn
                      size="sm"
                      rounded
                      flat
                      color="negative"
                      icon="delete"
                      label="Удалить"
                      @click=" () => { state.action = 'deleteResource'; return deleteRow(props.row.id)}"
                    />
                  </div>
            </q-tr>
          </template>
      </q-table>
      </q-tab-panel>

    </q-tab-panels>

    <!--Шаблон диалога скрыт и не отображается, вызывается из кода-->
    <!-- диалог добавления и обновления -->
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <div class="q-pa-md" style="max-width: 500px">
          <q-toolbar class="bg-grey-2">
            <q-toolbar-title>{{state.formTitle}}</q-toolbar-title>
          </q-toolbar>
          <br/>

          <div v-if="state.action === 'createThreshold'">
            <form @submit.prevent.stop="onSubmit">
            <q-select
              ref=inputMetricValid
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              square
              filled
              v-model="state.inputThreshold.metric"
              use-input
              input-debounce="0"
              :options="metricOptions"
              @filter="filterMetric"
              :clearable="true"
              label="Метрика"
              behavior="menu"
              >
              <!-- :options="state.metrics" -->
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Не найдено
                    <q-btn
                    color="green"
                    icon="add"
                    label="Добавить метрику"
                    @click=" () => {state.action = 'addMetricThreshold'; return addMetric()}"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <br/>
            <q-select
              ref="inputRoleValid"
              square
              filled
              v-model="state.inputThreshold.role"
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              use-input
              :clearable="true"
              input-debounce="0"
              :options="roleOptions"
              @filter="filterRole"
              label="Роль"
              behavior="menu"
              >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Не найдено
                    <q-btn
                    color="green"
                    icon="add"
                    label="Добавить роль"
                    @click=" () => {state.action = 'addRoleThreshold'; return addRole()}"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <br/>
            <q-select
              square
              filled
              v-model="state.inputThreshold.resource"
              use-input
              input-debounce="0"
              :options="resourceOptions"
              @filter="filterResource"
              :clearable="true"
              label="Ресурс"
              behavior="menu"
              hint="Укажите сначала роль. Если пусто, то порог будет для роли"
              >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section v-if="!state.inputThreshold.role" class="text-grey">
                    Не найдено. Укажите сначала роль
                  </q-item-section>
                  <q-item-section v-else class="text-grey">
                    Не найдено
                    <q-btn
                      color="green"
                      icon="add"
                      label="Добавить ресурс"
                      @click=" () => {state.action = 'addResourceThreshold'; return addResource()}"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <br/>
            <q-select
              ref="inputLevelValid"
              square
              filled
              v-model="state.inputThreshold.level"
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              input-debounce="0"
              label="Уровень"
              behavior="menu"
              :options="levelOptions"
              >
            </q-select>

            <div class="q-pa-md">
                <q-input
                  ref="inputValueValid"
                  v-model="state.inputThreshold.newValue"
                  lazy-rules
                  :rules="[
                    val => !!val || 'Обязательное поле'
                  ]"
                  type="number"
                  label="Значение"
                  >
                </q-input>
              </div>
            </form>
          </div>

          <div v-if="state.action === 'createMetric' || state.action === 'addMetricThreshold'">
          <q-input
                ref=inputMetricValid
                square
                use-input
                lazy-rules
                :rules="[
                val => !!val || 'Обязательное поле'
                ]"
                v-model="state.inputMetric.name"
                :autofocus="true"
                label="Название метрики"
                >
            </q-input>
          </div>

          <div v-if="state.action === 'createRole' || state.action === 'addRoleThreshold' || state.action === 'addRoleResource'">
          <q-input
                ref=inputRoleValid
                lazy-rules
                :rules="[
                val => !!val || 'Обязательное поле'
                ]"
                square
                use-input
                v-model="state.inputRole.name"
                :autofocus="true"
                label="Название роли"
                >
            </q-input>
          </div>

          <div v-if="state.action === 'createResource' || state.action === 'addResourceThreshold' || state.action === 'addResource'">
            <q-select
              ref="inputRoleValid"
              square
              filled
              v-model="state.inputResource.role"
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              use-input
              :clearable="true"
              input-debounce="0"
              :options="roleOptions"
              @filter="filterRole"
              label="Роль"
              behavior="menu"
              >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Не найдено
                    <q-btn
                    color="green"
                    icon="add"
                    label="Добавить Роль"
                    @click="() => { state.action = 'addRoleResource'; return addRole()}"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
              <q-input
                ref=inputResourceValid
                lazy-rules
                :rules="[
                  val => !!val || 'Обязательное поле'
                ]"
                square
                use-input
                v-model="state.inputResource.name"
                :autofocus="true"
                label="Название ресурса"
                >
              </q-input>
          </div>

          <div v-if="state.action === 'updateThreshold'">
            <q-input
              square
              v-model="state.inputThreshold.metric.name"
              :readonly="true"
              label="Метрика"
              >
            </q-input>
            <q-input
              square
              v-model="state.inputThreshold.role.name"
              :readonly="true"
              label="Роль"
              >
            </q-input>
            <q-input v-if="state.inputThreshold.resource"
                square
                v-model="state.inputThreshold.resource.name"
                :readonly="true"
                label="Ресурс"
                >
            </q-input>
            <div class="flex">
              <q-input style="width: 50%;"
                square
                v-model="state.inputThreshold.level"
                :readonly="true"
                label="Уровень"
                >
              </q-input>
              <q-input style="width: 50%;"
                square
                v-model="state.inputThreshold.values[state.inputThreshold.values.length - 1].value"
                :readonly="true"
                label="Значение"
                >
              </q-input>
            </div>
            <div class="q-pa-md">
              <q-input
                ref=inputValueValid
                lazy-rules
                :rules="[
                  val => !!val || 'Обязательное поле'
                ]"
                square
                v-model="state.inputThreshold.newValue"
                type="number"
                :autofocus="true"
                label="Новое значение"
                >
              </q-input>
            </div>
          </div>

          <div v-if="state.action === 'updateMetric'">
            <q-input
              ref=inputMetricValid
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              square
              v-model="state.inputMetric.name"
              :autofocus="true"
              label="Новое название"
              >
            </q-input>
          </div>

          <div v-if="state.action === 'updateRole'">
            <q-input
              ref=inputRoleValid
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              square
              v-model="state.inputRole.name"
              :autofocus="true"
              label="Новое название"
              >
            </q-input>
          </div>

          <div v-if="state.action === 'updateResource'">
            <q-input
              square
              v-model="state.inputResource.role.name"
              :readonly="true"
              label="Роль"
              >
            </q-input>
            <q-input
              ref=inputResourceValid
              lazy-rules
              :rules="[
                val => !!val || 'Обязательное поле'
              ]"
              square
              v-model="state.inputResource.name"
              :autofocus="true"
              label="Новое название"
              >
            </q-input>
          </div>

        </div>

        <q-card-actions align="right">
          <q-btn color="positive" label="Сохранить" @click="handleClickOk" />
          <q-btn color="negative" label="Отмена" @click="handleClickCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

</template>
