export default {
  en: {
    translation: {
      nav_bar: {
        create: 'Create Record',
        setting: 'Default Setting',
        toggle_theme: 'Toggle Theme'
      },
      default_settings: {
        title: 'Default Settings',
        language: 'Language',
        language_placeholder: 'Please select language',
        directory: 'Directory',
        directory_placeholder: 'Please select directory'
      },
      stream_config: {
        create: 'Create Record',
        edit: 'Edit Record',
        confirm: 'Confirm',
        title: 'Title',
        title_placeholder: 'Please enter title',
        room_url: 'Room URL',
        room_url_placeholder: 'Please enter room URL',
        line: 'Line',
        line_placeholder: 'Please select line',
        interval: 'Monitor Interval (seconds)',
        interval_placeholder: 'Please enter monitor interval, default 30s',
        proxy: 'Proxy(optional)',
        proxy_placeholder: 'Please enter proxy',
        cookie: 'Cookie(optional)',
        cookie_placeholder: 'Please enter cookie',
        filename: 'Filename',
        filename_placeholder: 'Please enter filename',
        directory: 'Directory',
        directory_placeholder: 'Please select directory',
        select: 'Select',
        title_can_not_be_empty: 'Title can not be empty',
        title_already_exists: 'Title already exists',
        room_url_can_not_be_empty: 'Room URL can not be empty',
        room_url_invalid: 'Room URL is invalid',
        filename_can_not_be_empty: 'Filename can not be empty',
        directory_can_not_be_empty: 'Directory can not be empty',
        interval_can_not_be_empty: 'Monitor interval can not be empty',
        interval_must_be_number: 'Monitor interval is invalid, please enter a number',
        interval_must_be_greater_than_20: 'Monitor interval is invalid, at least 20 seconds',
        proxy_invalid: 'Proxy is invalid',
        not_started: 'Not Started',
        preparing_to_record: 'Preparing to Record',
        monitoring: 'Monitoring',
        recording: 'Recording',
        preview: 'Preview',
        edit_record: 'Edit Record',
        confirm_delete: 'Are you sure you want to delete this record?',
        delete: 'Delete'
      },
      error_code: {
        title: 'Error',
        not_urls: 'Room does not exist or not live',
        not_support: 'The current live platform is not supported',
        invalid_proxy: 'Proxy is invalid',
        invalid_url: 'Room URL is invalid',
        time_out: 'Request timed out, try using or changing the proxy',
        forbidden: 'Request denied, try using or changing the proxy',
        current_line_error: 'Current line error, try using other lines',
        unknown_error: 'Unknown error'
      }
    }
  },
  cn: {
    translation: {
      nav_bar: {
        create: '新建录制项',
        setting: '默认配置',
        toggle_theme: '切换主题'
      },
      default_settings: {
        title: '默认配置',
        language: '语言',
        language_placeholder: '请选择语言',
        directory: '存储目录',
        directory_placeholder: '请选择存储目录'
      },
      stream_config: {
        confirm: '确认',
        confirm_delete: '确定删除该录制项? ({{title}})',
        delete: '删除',
        confirm_force_close_window: '当前有录制任务正在进行, 是否强制关闭窗口?',
        create: '新建录制项',
        edit: '编辑录制项',
        title: '标题',
        title_placeholder: '请输入标题',
        room_url: '直播间地址',
        room_url_placeholder: '请输入直播间地址',
        line: '线路',
        line_placeholder: '请选择线路',
        interval: '监控间隔(秒)',
        interval_placeholder: '请输入监控间隔, 默认30s',
        segment_time: '分段时长(分钟)',
        segment_time_placeholder: '请输入分段时长, 默认不分段',
        proxy: '代理(可选)',
        proxy_placeholder: '请输入代理',
        cookie: 'Cookie(可选)',
        cookie_placeholder: '请输入Cookie',
        filename: '文件名',
        filename_placeholder: '请输入存储文件名',
        directory: '存储目录',
        directory_placeholder: '请选择存储目录',
        select: '选择',
        title_can_not_be_empty: '标题不能为空',
        title_already_exists: '标题已存在',
        room_url_can_not_be_empty: '直播间地址不能为空',
        room_url_invalid: '直播间地址不合法',
        filename_can_not_be_empty: '文件名不能为空',
        directory_can_not_be_empty: '存储目录不能为空',
        interval_can_not_be_empty: '监控间隔不能为空',
        interval_must_be_number: '监控间隔不合法, 请输入数字',
        interval_must_be_greater_than_20: '监控间隔不合法, 至少20秒',
        segment_time_must_be_number: '分段时长不合法, 请输入数字或者不填',
        segment_time_must_be_greater_than_0: '分段时长不合法, 必须大于0',
        proxy_invalid: '代理地址不合法',
        not_started: '未开始',
        preparing_to_record: '准备录制中',
        monitoring: '监控中',
        recording: '录制中',
        video_format_conversion: '视频格式转换中'
      },
      start_record: '开始录制',
      user_stop_record: '停止录制(用户手动停止)',
      stream_end_stop_record: '停止录制(主播已停止直播)',
      error: {
        get_line: {
          not_urls: '直播间不存在或者未开播',
          not_support: '当前不支持该直播平台',
          invalid_proxy: '代理地址不合法',
          invalid_url: '直播间地址不合法',
          time_out: '请求超时, 尝试使用或者更换代理',
          forbidden: '请求被拒绝, 尝试使用或者更换代理',
          unknown_error: '未知错误'
        },
        start_record: {
          not_urls: '直播间未开播，开启监控录制功能',
          timeout: '请求超时，尝试使用或者更换代理',
          forbidden: '请求被拒绝，尝试使用或者更换代理',
          invalid_proxy: '代理地址不合法， 请检查代理地址',
          not_support: '当前不支持该直播平台',
          invalid_url: '直播间地址不合法'
        },
        stop_record: {
          current_line_error: '停止录制(当前线路错误，尝试使用其他线路)',
          timeout: '停止录制(请求超时，尝试使用或者更换代理)'
        }
      }
    }
  }
}
