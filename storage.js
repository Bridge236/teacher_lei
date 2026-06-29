// ==================================================
// 别点我 · 本地存储数据层
// 数据存储在浏览器 localStorage 中，名单在 JS 中预置
// ==================================================

// ----- 工具函数 -----
function bdwUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function _bdwLoad(key) {
  try { return JSON.parse(localStorage.getItem('bdw_' + key)); } catch(e) { return null; }
}

function _bdwSave(key, val) {
  localStorage.setItem('bdw_' + key, JSON.stringify(val));
}

// ----- 种子数据：23历史1班 39人 + 23历史2班 38人 -----
var BDW_SEED_CLASS_1 = {
  id: 'seed-23history1',
  name: '23历史1班',
  is_default: true,
  created_at: '2026-06-29T09:00:00.000Z'
};

var BDW_SEED_STUDENTS_1 = [
  '代如瑶','董梓瀛','高佳洁','谷润桐','霍夏苗',
  '冀星','李润泽','刘栐均','刘丰赫','刘涵',
  '刘寒逸','刘金','刘雨釩','刘紫琦','吕晓丹',
  '马连亮','孟一飞','牛晓航','庞宇彤','庞皓月',
  '乔子桐','史温卓','宋鑫彤','孙雅菲','王雨欣',
  '王宇佳','吴翔','谢庆鹏','杨冠辞','张博元',
  '张凯悦','张思迪','张旭阳','张雅','张雅蕾',
  '张钰淇','郑思嘉','朱鑫河','闫鑫月'
];

var BDW_SEED_CLASS_2 = {
  id: 'seed-23history2',
  name: '23历史2班',
  is_default: false,
  created_at: '2026-06-29T09:30:00.000Z'
};

var BDW_SEED_STUDENTS_2 = [
  '白子震','陈畅','崔远洋','杜伊琳','杜子怡',
  '郭佳顺','郭媛','韩雨轩','景宏斌','李锦昌',
  '李进辉','李思雨','李心琦','李皓熙','刘长永',
  '刘格莹','刘宏帅','路子墨','施宇杰','苏晓轩',
  '孙文权','唐奕鍇','田佳莹','田一彤','王璐',
  '王璐璐','谢鑫','许东亮','薛赟','杨佳姿',
  '姚一冰','展浩然','张雨杭','赵家莹','郑童语',
  '窦烨杭','薛智洪','王晗'
];

function _bdwEnsureSeed() {
  if (!_bdwLoad('_seeded_v3')) {
    // 种子班级
    _bdwSave('classes', [BDW_SEED_CLASS_1, BDW_SEED_CLASS_2]);
    // 种子学生 - 1班
    var students1 = BDW_SEED_STUDENTS_1.map(function(name) {
      return { id: bdwUuid(), name: name, class_id: BDW_SEED_CLASS_1.id, created_at: BDW_SEED_CLASS_1.created_at };
    });
    _bdwSave('students_' + BDW_SEED_CLASS_1.id, students1);
    _bdwSave('records_' + BDW_SEED_CLASS_1.id, []);
    // 种子学生 - 2班
    var students2 = BDW_SEED_STUDENTS_2.map(function(name) {
      return { id: bdwUuid(), name: name, class_id: BDW_SEED_CLASS_2.id, created_at: BDW_SEED_CLASS_2.created_at };
    });
    _bdwSave('students_' + BDW_SEED_CLASS_2.id, students2);
    _bdwSave('records_' + BDW_SEED_CLASS_2.id, []);
    // 标记已种子
    _bdwSave('_seeded_v3', true);
  }
}

// 启动时执行种子
_bdwEnsureSeed();

// ----- 会话管理 -----
var BdwSession = {
  check: function() {
    return localStorage.getItem('bdw_logged_in') === 'true';
  },
  getUserEmail: function() {
    return localStorage.getItem('bdw_user_email') || '';
  },
  logout: function() {
    localStorage.removeItem('bdw_logged_in');
    localStorage.removeItem('bdw_user_email');
    location.href = 'index.html';
  },
  requireLogin: function() {
    if (!this.check()) {
      location.href = 'index.html';
      return false;
    }
    return true;
  }
};

// ----- 班级 -----
var BdwClasses = {
  getAll: function() {
    return _bdwLoad('classes') || [];
  },

  getById: function(id) {
    var all = this.getAll();
    return all.find(function(c) { return c.id === id; }) || null;
  },

  getDefault: function() {
    var all = this.getAll();
    var def = all.find(function(c) { return c.is_default === true; });
    return def || (all.length > 0 ? all[0] : null);
  },

  add: function(name) {
    var all = this.getAll();
    var isFirst = all.length === 0;
    var cls = {
      id: bdwUuid(),
      name: name,
      is_default: isFirst,
      created_at: new Date().toISOString()
    };
    all.push(cls);
    _bdwSave('classes', all);
    _bdwSave('students_' + cls.id, []);
    _bdwSave('records_' + cls.id, []);
    return cls;
  },

  update: function(id, changes) {
    var all = this.getAll();
    var idx = all.findIndex(function(c) { return c.id === id; });
    if (idx === -1) return null;
    Object.keys(changes).forEach(function(k) { all[idx][k] = changes[k]; });
    _bdwSave('classes', all);
    return all[idx];
  },

  setDefault: function(id) {
    var all = this.getAll();
    all.forEach(function(c) { c.is_default = (c.id === id); });
    _bdwSave('classes', all);
  },

  remove: function(id) {
    var all = this.getAll();
    _bdwSave('classes', all.filter(function(c) { return c.id !== id; }));
    localStorage.removeItem('bdw_students_' + id);
    localStorage.removeItem('bdw_records_' + id);
  }
};

// ----- 学生 -----
var BdwStudents = {
  getAll: function(classId) {
    return _bdwLoad('students_' + classId) || [];
  },

  getById: function(id) {
    var allClasses = BdwClasses.getAll();
    for (var i = 0; i < allClasses.length; i++) {
      var students = this.getAll(allClasses[i].id);
      var found = students.find(function(s) { return s.id === id; });
      if (found) return found;
    }
    return null;
  },

  count: function(classId) {
    return this.getAll(classId).length;
  },

  add: function(name, classId) {
    var student = {
      id: bdwUuid(),
      name: name,
      class_id: classId,
      created_at: new Date().toISOString()
    };
    var students = this.getAll(classId);
    students.push(student);
    _bdwSave('students_' + classId, students);
    return student;
  },

  addBatch: function(names, classId) {
    var students = this.getAll(classId);
    var existingNames = new Set(students.map(function(s) { return s.name; }));
    var added = [];
    names.forEach(function(name) {
      if (!existingNames.has(name)) {
        var s = { id: bdwUuid(), name: name, class_id: classId, created_at: new Date().toISOString() };
        students.push(s);
        added.push(s);
      }
    });
    _bdwSave('students_' + classId, students);
    return added;
  },

  update: function(id, changes) {
    // 遍历所有班级找到该学生
    var allClasses = BdwClasses.getAll();
    for (var i = 0; i < allClasses.length; i++) {
      var students = this.getAll(allClasses[i].id);
      var idx = students.findIndex(function(s) { return s.id === id; });
      if (idx !== -1) {
        Object.keys(changes).forEach(function(k) { students[idx][k] = changes[k]; });
        _bdwSave('students_' + allClasses[i].id, students);
        return students[idx];
      }
    }
    return null;
  },

  remove: function(id) {
    var allClasses = BdwClasses.getAll();
    for (var i = 0; i < allClasses.length; i++) {
      var students = this.getAll(allClasses[i].id);
      var idx = students.findIndex(function(s) { return s.id === id; });
      if (idx !== -1) {
        students.splice(idx, 1);
        _bdwSave('students_' + allClasses[i].id, students);
        return;
      }
    }
  }
};

// ----- 点名记录 -----
var BdwRecords = {
  getAll: function(classId) {
    return _bdwLoad('records_' + classId) || [];
  },

  add: function(classId, studentId, studentName) {
    var record = {
      id: bdwUuid(),
      class_id: classId,
      student_id: studentId,
      student_name: studentName,
      rolled_at: new Date().toISOString()
    };
    var records = this.getAll(classId);
    records.unshift(record);
    _bdwSave('records_' + classId, records);
    return record;
  },

  count: function(classId) {
    return this.getAll(classId).length;
  }
};
