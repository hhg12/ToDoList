import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'foQVX4FrwQI0JVAeCY3wuSe7-gzGzoHsz';
var APP_KEY = 'QjhU3mgLktXv031P3wwv4UGi';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var app = new Vue({
  el: '#app',
  data: {
    actionType: 'signUp',
    formData: {
      username: '',
      password: ''
    },
    newTodo: '',
    todoList: [],
    currentUser: null,
    showToDo: 'all'
  },
  created: function(){
    
    this.currentUser = this.getCurrentUser()
    this.readTodo()
    
  },
  methods: {
    readTodo: function(){
      if(this.currentUser){   
        var query = new AV.Query('AVTodos')
        query.find().then((todos)=>{
          console.log(todos)
          let avAllTodos = todos[0]
          let id = avAllTodos.id
          this.todoList = JSON.parse(avAllTodos.attributes.content)
          this.todoList.id = id
        },function(error){
          console.error(error)
        })
      }
    },
    addTodo: function(){
      let d = new Date();
      let data = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 ' + d.getHours()+':'+d.getMinutes()
      this.todoList.push({
        title: this.newTodo,
        createdAt: data,
        done: false
      })
      this.newTodo = ''
      this.saveOrUpdateTodos()
    },
    removeTodo: function(todo){
      let index = this.todoList.indexOf(todo)
      this.todoList.splice(index,1)
      this.saveOrUpdateTodos()
    },
    updateTodos: function(){
      let dataString = JSON.stringify(this.todoList)
      let todo = AV.Object.createWithoutData('AVTodos',this.todoList.id)
      todo.set('content',dataString)
      todo.save().then(function(){
        console.log('更新成功')
      })
    },
    saveTodo: function(){
      let dataString = JSON.stringify(this.todoList)  
      var AVTodos = AV.Object.extend('AVTodos')
      var avTodos = new AVTodos()
      var acl = new AV.ACL()
      acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
      acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写
      
      avTodos.set('content', dataString);
      avTodos.setACL(acl) // 设置访问控制
      avTodos.save().then((todo)=>{
        this.todoList.id = todo.id
      },function(error){
        console.error('保存失败')
      })
    },
    saveOrUpdateTodos: function(){
      console.log(this.todoList.id)
      if(this.todoList.id){
        this.updateTodos()
      }else{
        this.saveTodo()
      }
    },
    signUp: function(){
      var user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser)=>{
        this.currentUser = this.getCurrentUser();
      },(error)=>{
        alert("注册失败");
      });
    },
    login: function(){
      AV.User.logIn(this.formData.username,this.formData.password).then((lofindeUser)=>{
        this.currentUser = this.getCurrentUser();
        console.log( this.currentUser)
        this.readTodo()
      },(error)=>{
        alert("登陆失败");
      });
      
    },
    getCurrentUser: function () { 
      let current = AV.User.current()
      if(current){
        let {id, createdAt, attributes: {username}} = current
        return {id, createdAt, username}
      }
      else {
        return null
      }
    },
    logOut: function(){
      AV.User.logOut()
      this.currentUser = AV.User.current()
      window.location.reload()
    },
    toggleDone: function(todo){
      console.log('toggle')
      todo.done = !todo.done
      this.updateTodos()
    },
    isShow: function(todo){
      if(this.showToDo == 'all'){
        return true
      }else if(this.showToDo == String(todo.done)){
        console.log(2)
        return true
      }else{
        return false
      }
    },
    clearAll: function(){
      this.todoList = []
    }

  }
})