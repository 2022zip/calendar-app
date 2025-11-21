document.addEventListener('DOMContentLoaded', function () {
    const daysGrid = document.querySelector('.days-grid');
    const scheduleList = document.querySelector('.schedule-list');
    const yearDisplay = document.querySelector('.date-selector .year');
    const monthDisplay = document.querySelector('.date-selector .month');

    let currentYear, currentMonth;

    if (!localStorage.getItem('migration_done_v6')) {
        const hardcodedEvents = [
            {
                id: 'event-1',
                title: '宁波大央科技有限公司',
                startDate: '2025年7月9日 上午10:30',
                endDate: '2025年7月9日 上午10:40',
                date: '2025-07-09',
                notes: '宁波大央科技有限公司案情速览',
                customerLevel: '宁波大央科技成立于2010年，专注光电子灭蚊与植物源驱蚊，拥有数百项病媒防控专利，是行业标准牵头单位之一。 公开招聘信息显示：公司建筑面积约5.5万㎡，年产值约5亿元人民币、年出口约千万美元，员工规模约600人，在有些口径下被归入“1000–5000人”档的高成长科技型中小企业/隐形冠军培育企业。 → 归类：细分赛道中型偏大型制造+电商企业，有研发、有品牌、有出口，有一定IT/管理投入能力。',
                hiddenNeeds: '1.1.多品牌多渠道一体化管理：旗下“大央、俏蜻蜓、Cokit、Kinven”等多品牌，既做欧美ODM/OEM，又做国内电商与连锁药房/KA，典型“多品牌+多渠道+多地区”经营，容易出现订单、库存、价格、促销、铺货数据分散的问题，需要更强的全渠道经营与库存可视化。\n\n 2. 研发与知识产权资产化管理：手握数百项专利、主导行业标准，核心优势在技术与配方，但专利、标准、实验数据分散在不同系统与文档中，存在研发项目进度、成果沉淀、专利与配方的全生命周期管理需求。\n\n 3. 制造与品质精益化：有多条物理蚊虫防控生产线和在建新厂区，产品又要满足欧美与国内多重认证，对MES/质检追溯、批次管理、设备效率与良率分析的精细化要求会逐步抬高。\n\n 4. 合规与标准化运营：公司牵头起草户外UV LED灭蚊灯行业标准，并通过BSCI、ISO与知识产权管理规范等认证，对外要对接政府招标、商超/药房连锁与海外客户，对内需要标准化流程与合规风险管控（认证、检测报告、供应链准入等）。',
                caseJudgment: '• 客户定位：这是一个在细分驱蚊/光电灭蚊赛道里具有话语权的“技术型制造+电商出口”企业，属于有成长性、有技术壁垒、对品牌与合规都很在意的客户。 • 机会属性：不是单点小工具客户，更适合作为“研发+制造+电商一体化数智化/信息化项目”，可以从某一强痛点切入（如：生产质检追溯、电商订单与库存一体化、研发/专利管理），再逐步扩展。 • 决策风格：既与科研院所、疾控中心长期合作，又频繁参与行业标准和政府项目，说明管理层对“长期投入+行业地位”有认知，对有行业案例、有方法论的解决方案型供应商更友好，但也会看重落地效果与性价比。',
                summary: '宁波大央科技是一家在“灭蚊/驱蚊”细分赛道里具技术和标准话语权的中大型制造+电商企业，现金流与成长性都不错，适合作为从“研发–制造–电商–合规”一体化数智化项目切入的标杆型客户。'
            },
            {
                id: 'event-2',
                title: '惠康客诉线上会议',
                startDate: '2025年7月13日 上午9:00',
                endDate: '2025年7月13日 上午10:00',
                date: '2025-07-13'
            },
            {
                id: 'event-3',
                title: '惠康客诉线上会议',
                startDate: '2025年7月9日 上午9:00',
                endDate: '2025年7月9日 上午10:00',
                date: '2025-07-09',
                location: '线上'
            },
            {
                id: 'event-4',
                title: '惠康客诉会后记录与方案确认',
                startDate: '2025年7月9日 上午10:00',
                endDate: '2025年7月9日 上午10:30',
                date: '2025-07-09'
            },
            {
                id: 'event-5',
                title: '前往江丰科技途中要点整理',
                startDate: '2025年7月9日 上午10:30',
                endDate: '2025年7月9日 上午11:10',
                date: '2025-07-09'
            },
            {
                id: 'event-6',
                title: '江丰科技现场沟通',
                startDate: '2025年7月9日 上午11:10',
                endDate: '2025年7月9日 下午12:00',
                date: '2025-07-09',
                location: '江丰科技现场'
            },
            {
                id: 'event-7',
                title: '与王总午餐沟通',
                startDate: '2025年7月9日 下午12:00',
                endDate: '2025年7月9日 下午1:00',
                date: '2025-07-09'
            },
            {
                id: 'event-8',
                title: '返回途中信息整理与致谢讯息',
                startDate: '2025年7月9日 下午1:00',
                endDate: '2025年7月9日 下午1:30',
                date: '2025-07-09'
            },
            {
                id: 'event-9',
                title: '大发光纤合同条款与底线对表',
                startDate: '2025年7月9日 下午1:30',
                endDate: '2025年7月9日 下午2:00',
                date: '2025-07-09'
            },
            {
                id: 'event-10',
                title: '大发光纤合同洽谈',
                startDate: '2025年7月9日 下午2:00',
                endDate: '2025年7月9日 下午3:00',
                date: '2025-07-09'
            },
            {
                id: 'event-11',
                title: '大发光纤合同结果确认与后续动作安排',
                startDate: '2025年7月9日 下午3:00',
                endDate: '2025年7月9日 下午4:00',
                date: '2025-07-09'
            },
            {
                id: 'event-12',
                title: '今日主要客户机会与风险盘点',
                startDate: '2025年7月9日 下午4:00',
                endDate: '2025年7月9日 下午5:00',
                date: '2025-07-09'
            },
            {
                id: 'event-13',
                title: '同行业潜在客户轻触达与约访',
                startDate: '2025年7月9日 下午5:00',
                endDate: '2025年7月9日 下午6:00',
                date: '2025-07-09'
            },
            {
                id: 'event-14',
                title: '晚餐与机动沟通（奥克斯电器）',
                startDate: '2025年7月9日 下午6:00',
                endDate: '2025年7月9日 下午7:00',
                date: '2025-07-09'
            },
            {
                id: 'event-15',
                title: '填写日报',
                startDate: '2025年7月9日 下午7:00',
                endDate: '2025年7月9日 下午8:00',
                date: '2025-07-09'
            },
            {
                id: 'event-16',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月9日 下午8:00',
                endDate: '2025年7月9日 下午9:00',
                date: '2025-07-09'
            },
            {
                id: 'event-17',
                title: '惠康客诉线上会议',
                startDate: '2025年7月8日 上午9:00',
                endDate: '2025年7月8日 上午10:00',
                date: '2025-07-08'
            },
            {
                id: 'event-18',
                title: '惠康客诉会后记录与方案确认',
                startDate: '2025年7月8日 上午10:00',
                endDate: '2025年7月8日 上午10:30',
                date: '2025-07-08'
            },
            {
                id: 'event-19',
                title: '前往江丰科技途中要点整理',
                startDate: '2025年7月8日 上午10:30',
                endDate: '2025年7月8日 上午11:10',
                date: '2025-07-08'
            },
            {
                id: 'event-20',
                title: '江丰科技现场沟通',
                startDate: '2025年7月8日 上午11:10',
                endDate: '2025年7月8日 下午12:00',
                date: '2025-07-08'
            },
            {
                id: 'event-21',
                title: '与王总午餐沟通',
                startDate: '2025年7月8日 下午12:00',
                endDate: '2025年7月8日 下午1:00',
                date: '2025-07-08'
            },
            {
                id: 'event-22',
                title: '返回途中信息整理与致谢讯息',
                startDate: '2025年7月8日 下午1:00',
                endDate: '2025年7月8日 下午1:30',
                date: '2025-07-08'
            },
            {
                id: 'event-23',
                title: '大发光纤合同条款与底线对表',
                startDate: '2025年7月8日 下午1:30',
                endDate: '2025年7月8日 下午2:00',
                date: '2025-07-08'
            },
            {
                id: 'event-24',
                title: '大发光纤合同洽谈',
                startDate: '2025年7月8日 下午2:00',
                endDate: '2025年7月8日 下午3:00',
                date: '2025-07-08'
            },
            {
                id: 'event-25',
                title: '大发光纤合同结果确认与后续动作安排',
                startDate: '2025年7月8日 下午3:00',
                endDate: '2025年7月8日 下午4:00',
                date: '2025-07-08'
            },
            {
                id: 'event-26',
                title: '今日主要客户机会与风险盘点',
                startDate: '2025年7月8日 下午4:00',
                endDate: '2025年7月8日 下午5:00',
                date: '2025-07-08'
            },
            {
                id: 'event-27',
                title: '同行业潜在客户轻触达与约访',
                startDate: '2025年7月8日 下午5:00',
                endDate: '2025年7月8日 下午6:00',
                date: '2025-07-08'
            },
            {
                id: 'event-28',
                title: '晚餐与机动沟通（奥克斯电器）',
                startDate: '2025年7月8日 下午6:00',
                endDate: '2025年7月8日 下午7:00',
                date: '2025-07-08'
            },
            {
                id: 'event-29',
                title: '填写日报',
                startDate: '2025年7月8日 下午7:00',
                endDate: '2025年7月8日 下午8:00',
                date: '2025-07-08'
            },
            {
                id: 'event-30',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月8日 下午8:00',
                endDate: '2025年7月8日 下午9:00',
                date: '2025-07-08'
            },
            {
                id: 'event-31',
                title: '杭州凌坤自动化设备有限公司年度需求访谈（线上）',
                startDate: '2025年7月9日 上午9:00',
                endDate: '2025年7月9日 上午10:00',
                date: '2025-07-09'
            },
            {
                id: 'event-32',
                title: '凌坤自动化会议纪要与系统机会整理',
                startDate: '2025年7月9日 上午10:00',
                endDate: '2025年7月9日 上午10:30',
                date: '2025-07-09'
            },
            {
                id: 'event-33',
                title: '前往杭州荣松包装制品有限公司途中要点整理',
                startDate: '2025年7月9日 上午10:30',
                endDate: '2025年7月9日 上午11:10',
                date: '2025-07-09'
            },
            {
                id: 'event-34',
                title: '杭州荣松包装制品有限公司现场产线走访与痛点盘点',
                startDate: '2025年7月9日 上午11:10',
                endDate: '2025年7月9日 下午12:00',
                date: '2025-07-09'
            },
            {
                id: 'event-35',
                title: '与荣松包装生产负责人午餐沟通（确认导入节奏）',
                startDate: '2025年7月9日 下午12:00',
                endDate: '2025年7月9日 下午1:00',
                date: '2025-07-09'
            },
            {
                id: 'event-36',
                title: '返回途中信息整理与致谢讯息',
                startDate: '2025年7月9日 下午1:00',
                endDate: '2025年7月9日 下午1:30',
                date: '2025-07-09'
            },
            {
                id: 'event-37',
                title: '杭州宏羽服饰有限公司现况与历史项目资料快速梳理',
                startDate: '2025年7月9日 下午1:30',
                endDate: '2025年7月9日 下午2:00',
                date: '2025-07-09'
            },
            {
                id: 'event-38',
                title: '杭州宏羽服饰有限公司生产排程与门店补货方案初谈',
                startDate: '2025年7月9日 下午2:00',
                endDate: '2025年7月9日 下午3:00',
                date: '2025-07-09'
            },
            {
                id: 'event-39',
                title: '宏羽服饰合作条款与报价测算对表',
                startDate: '2025年7月9日 下午3:00',
                endDate: '2025年7月9日 下午4:00',
                date: '2025-07-09'
            },
            {
                id: 'event-40',
                title: '今日三家客户机会与风险盘点（凌坤/荣松/宏羽）',
                startDate: '2025年7月9日 下午4:00',
                endDate: '2025年7月9日 下午5:00',
                date: '2025-07-09'
            },
            {
                id: 'event-41',
                title: '同园区制造业潜在客户轻触达与约访',
                startDate: '2025年7月9日 下午5:00',
                endDate: '2025年7月9日 下午6:00',
                date: '2025-07-09'
            },
            {
                id: 'event-42',
                title: '晚餐与机动沟通（视客户加场而定）',
                startDate: '2025年7月9日 下午6:00',
                endDate: '2025年7月9日 下午7:00',
                date: '2025-07-09'
            },
            {
                id: 'event-43',
                title: '填写日报与CRM更新',
                startDate: '2025年7月9日 下午7:00',
                endDate: '2025年7月9日 下午8:00',
                date: '2025-07-09'
            },
            {
                id: 'event-44',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月9日 下午8:00',
                endDate: '2025年7月9日 下午9:00',
                date: '2025-07-09'
            },
            {
                id: 'event-45',
                title: '润展（杭州）新材料有限公司年度订单与产能规划沟通',
                startDate: '2025年7月7日 上午9:00',
                endDate: '2025年7月7日 上午10:00',
                date: '2025-07-07'
            },
            {
                id: 'event-46',
                title: '润展新材料需求优先级与系统蓝图粗排',
                startDate: '2025年7月7日 上午10:00',
                endDate: '2025年7月7日 上午10:30',
                date: '2025-07-07'
            },
            {
                id: 'event-47',
                title: '前往杭州安泰工艺品有限公司途中整理访谈要点',
                startDate: '2025年7月7日 上午10:30',
                endDate: '2025年7月7日 上午11:10',
                date: '2025-07-07'
            },
            {
                id: 'event-48',
                title: '杭州安泰工艺品有限公司打样/接单流程走查',
                startDate: '2025年7月7日 上午11:10',
                endDate: '2025年7月7日 中午12:00',
                date: '2025-07-07'
            },
            {
                id: 'event-49',
                title: '与安泰工艺品业务与生产双线午餐沟通',
                startDate: '2025年7月7日 中午12:00',
                endDate: '2025年7月7日 下午1:00',
                date: '2025-07-07'
            },
            {
                id: 'event-50',
                title: '安泰工艺品项目推动关键干系人与决策链梳理',
                startDate: '2025年7月7日 下午1:00',
                endDate: '2025年7月7日 下午1:30',
                date: '2025-07-07'
            },
            {
                id: 'event-51',
                title: '杭州辉创实业有限公司成本结构与库存策略访谈准备',
                startDate: '2025年7月7日 下午1:30',
                endDate: '2025年7月7日 下午2:00',
                date: '2025-07-07'
            },
            {
                id: 'event-52',
                title: '杭州辉创实业有限公司产销协同与库存周转优化讨论',
                startDate: '2025年7月7日 下午2:00',
                endDate: '2025年7月7日 下午3:00',
                date: '2025-07-07'
            },
            {
                id: 'event-53',
                title: '辉创实业业务蓝图确认与阶段性里程碑对表',
                startDate: '2025年7月7日 下午3:00',
                endDate: '2025年7月7日 下午4:00',
                date: '2025-07-07'
            },
            {
                id: 'event-54',
                title: '今日客户价值评估与潜在标杆案例筛选（润展/安泰/辉创）',
                startDate: '2025年7月7日 下午4:00',
                endDate: '2025年7月7日 下午5:00',
                date: '2025-07-07'
            },
            {
                id: 'event-55',
                title: '拜访周边制造业企业，收集共性需求线索',
                startDate: '2025年7月7日 下午5:00',
                endDate: '2025年7月7日 下午6:00',
                date: '2025-07-07'
            },
            {
                id: 'event-56',
                title: '晚餐与机动沟通（安排后续技术评估会）',
                startDate: '2025年7月7日 晚上6:00',
                endDate: '2025年7月7日 晚上7:00',
                date: '2025-07-07'
            },
            {
                id: 'event-57',
                title: '填写日报与会议纪要归档',
                startDate: '2025年7月7日 晚上7:00',
                endDate: '2025年7月7日 晚上8:00',
                date: '2025-07-07'
            },
            {
                id: 'event-58',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月7日 晚上8:00',
                endDate: '2025年7月7日 晚上9:00',
                date: '2025-07-07'
            },
            {
                id: 'event-59',
                title: '杭州强勃包装制品有限公司客户结构与产品组合访谈',
                startDate: '2025年7月10日 上午9:00',
                endDate: '2025年7月10日 上午10:00',
                date: '2025-07-10'
            },
            {
                id: 'event-60',
                title: '强勃包装生产节奏与瓶颈工序梳理',
                startDate: '2025年7月10日 上午10:00',
                endDate: '2025年7月10日 上午10:30',
                date: '2025-07-10'
            },
            {
                id: 'event-61',
                title: '前往杭州尚逵机械设备有限公司途中准备演示方案',
                startDate: '2025年7月10日 上午10:30',
                endDate: '2025年7月10日 上午11:10',
                date: '2025-07-10'
            },
            {
                id: 'event-62',
                title: '杭州尚逵机械设备有限公司售前售后流程与备件管理讨论',
                startDate: '2025年7月10日 上午11:10',
                endDate: '2025年7月10日 中午12:00',
                date: '2025-07-10'
            },
            {
                id: 'event-63',
                title: '与尚逵机械销售/服务团队午餐沟通（确认系统诉求）',
                startDate: '2025年7月10日 中午12:00',
                endDate: '2025年7月10日 下午1:00',
                date: '2025-07-10'
            },
            {
                id: 'event-64',
                title: '尚逵机械机会级别评估与内部立项建议草拟',
                startDate: '2025年7月10日 下午1:00',
                endDate: '2025年7月10日 下午1:30',
                date: '2025-07-10'
            },
            {
                id: 'event-65',
                title: '浙江海明实业有限公司经营范围与生产布局快速了解',
                startDate: '2025年7月10日 下午1:30',
                endDate: '2025年7月10日 下午2:00',
                date: '2025-07-10'
            },
            {
                id: 'event-66',
                title: '浙江海明实业有限公司多工厂协同与报表需求访谈',
                startDate: '2025年7月10日 下午2:00',
                endDate: '2025年7月10日 下午3:00',
                date: '2025-07-10'
            },
            {
                id: 'event-67',
                title: '海明实业预算、合同与实施资源配置粗排',
                startDate: '2025年7月10日 下午3:00',
                endDate: '2025年7月10日 下午4:00',
                date: '2025-07-10'
            },
            {
                id: 'event-68',
                title: '今日三家客户阶段性推进策略确定（强勃/尚逵/海明）',
                startDate: '2025年7月10日 下午4:00',
                endDate: '2025年7月10日 下午5:00',
                date: '2025-07-10'
            },
            {
                id: 'event-69',
                title: '追踪历史沉睡线索，筛选可唤醒制造业客户',
                startDate: '2025年7月10日 下午5:00',
                endDate: '2025年7月10日 下午6:00',
                date: '2025-07-10'
            },
            {
                id: 'event-70',
                title: '晚餐与机动沟通（视客户加开需求评审会）',
                startDate: '2025年7月10日 晚上6:00',
                endDate: '2025年7月10日 晚上7:00',
                date: '2025-07-10'
            },
            {
                id: 'event-71',
                title: '填写日报与销售漏斗更新',
                startDate: '2025年7月10日 晚上7:00',
                endDate: '2025年7月10日 晚上8:00',
                date: '2025-07-10'
            },
            {
                id: 'event-72',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月10日 晚上8:00',
                endDate: '2025年7月10日 晚上9:00',
                date: '2025-07-10'
            },
            {
                id: 'event-73',
                title: '杭州初芯服饰有限公司新品上市节奏与供应链协同讨论',
                startDate: '2025年7月11日 上午9:00',
                endDate: '2025年7月11日 上午10:00',
                date: '2025-07-11'
            },
            {
                id: 'event-74',
                title: '初芯服饰门店补货逻辑与系统参数需求整理',
                startDate: '2025年7月11日 上午10:00',
                endDate: '2025年7月11日 上午10:30',
                date: '2025-07-11'
            },
            {
                id: 'event-75',
                title: '前往浙江三锁实业有限公司途中复盘服饰行业共性需求',
                startDate: '2025年7月11日 上午10:30',
                endDate: '2025年7月11日 上午11:10',
                date: '2025-07-11'
            },
            {
                id: 'event-76',
                title: '浙江三锁实业有限公司生产流程与质量管控现状访谈',
                startDate: '2025年7月11日 上午11:10',
                endDate: '2025年7月11日 中午12:00',
                date: '2025-07-11'
            },
            {
                id: 'event-77',
                title: '与三锁实业生产/品质联合午餐沟通（锁定试点线）',
                startDate: '2025年7月11日 中午12:00',
                endDate: '2025年7月11日 下午1:00',
                date: '2025-07-11'
            },
            {
                id: 'event-78',
                title: '三锁实业导入风险点与缓冲方案记录',
                startDate: '2025年7月11日 下午1:00',
                endDate: '2025年7月11日 下午1:30',
                date: '2025-07-11'
            },
            {
                id: 'event-79',
                title: '杭州世佳医疗器械有限公司合规要求与仓储流程了解',
                startDate: '2025年7月11日 下午1:30',
                endDate: '2025年7月11日 下午2:00',
                date: '2025-07-11'
            },
            {
                id: 'event-80',
                title: '杭州世佳医疗器械有限公司批号、追溯与质检流程讨论',
                startDate: '2025年7月11日 下午2:00',
                endDate: '2025年7月11日 下午3:00',
                date: '2025-07-11'
            },
            {
                id: 'event-81',
                title: '世佳医疗器械项目实施路径与排期初步对表',
                startDate: '2025年7月11日 下午3:00',
                endDate: '2025年7月11日 下午4:00',
                date: '2025-07-11'
            },
            {
                id: 'event-82',
                title: '今日客户分行业机会盘点（服饰/五金/医疗器械）',
                startDate: '2025年7月11日 下午4:00',
                endDate: '2025年7月11日 下午5:00',
                date: '2025-07-11'
            },
            {
                id: 'event-83',
                title: '对接内部合规/医药行业顾问，确认方案可行性',
                startDate: '2025年7月11日 下午5:00',
                endDate: '2025年7月11日 下午6:00',
                date: '2025-07-11'
            },
            {
                id: 'event-84',
                title: '晚餐与机动沟通',
                startDate: '2025年7月11日 晚上6:00',
                endDate: '2025年7月11日 晚上7:00',
                date: '2025-07-11'
            },
            {
                id: 'event-85',
                title: '填写日报与关键客户画像更新',
                startDate: '2025年7月11日 晚上7:00',
                endDate: '2025年7月11日 晚上8:00',
                date: '2025-07-11'
            },
            {
                id: 'event-86',
                title: '日终复盘与明日三件事规划',
                startDate: '2025年7月11日 晚上8:00',
                endDate: '2025年7月11日 晚上9:00',
                date: '2025-07-11'
            }
        ];

        let events = JSON.parse(localStorage.getItem('events')) || [];
        const existingIds = new Set(events.map(e => e.id));
        hardcodedEvents.forEach(he => {
            if (!existingIds.has(he.id)) {
                events.push(he);
            }
        });


        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('migration_done_v6', 'true');
    }
    function initialize() {
        const hashParams = new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : '');
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date') || hashParams.get('date');
        let initialDay;

        if (dateParam) {
            const parts = dateParam.split('-').map(p => parseInt(p, 10));
            if (parts.length === 3 && !parts.some(isNaN)) {
                currentYear = parts[0];
                currentMonth = parts[1] - 1;
                initialDay = parts[2];
            } else {
                const today = new Date();
                currentYear = today.getFullYear();
                currentMonth = today.getMonth();
                initialDay = today.getDate();
            }
        } else {
            currentYear = 2025;
            currentMonth = 6; // July
            initialDay = 2;
        }

        if (yearDisplay) {
            yearDisplay.innerHTML = `&lt; ${currentYear}年`;
        }
        if (monthDisplay) {
            monthDisplay.textContent = `${currentMonth + 1}月`;
        }

        generateCalendar();
        renderSchedule(initialDay);

        // Highlight the correct day in the calendar without simulating a click
        const currentSelected = daysGrid.querySelector('.today');
        if (currentSelected) {
            currentSelected.classList.remove('today');
        }
        const dayToSelect = Array.from(daysGrid.querySelectorAll('.day')).find(d => d.textContent == initialDay);
        if (dayToSelect) {
            dayToSelect.classList.add('today');
            // Scroll to the selected day
            dayToSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Update the 'Add Event' button link
        const selectedDate = new Date(currentYear, currentMonth, initialDay);
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const addEventBtn = document.getElementById('add-event-btn');
        if (addEventBtn) {
            addEventBtn.href = `add_event.html?date=${formattedDate}`;
        }
    }

    window.addEventListener('hashchange', initialize);
    initialize();

    function getStoredEvents() {
        return JSON.parse(localStorage.getItem('events')) || [];
    }

    function generateCalendar() {
        daysGrid.innerHTML = '';
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const storedEvents = getStoredEvents();

        for (let i = 0; i < firstDayOfMonth; i++) {
            daysGrid.innerHTML += '<div></div>';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasEvent = storedEvents.some(event => event.date === dateStr);
            if (hasEvent) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dayDiv.appendChild(dot);
            }
            
            dayDiv.addEventListener('click', () => {
                const currentSelected = daysGrid.querySelector('.today');
                if (currentSelected) {
                    currentSelected.classList.remove('today');
                }
                dayDiv.classList.add('today');
                renderSchedule(i);

                const selectedDate = new Date(currentYear, currentMonth, i);
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                const addEventBtn = document.getElementById('add-event-btn');
                if (addEventBtn) {
                    addEventBtn.href = `add_event.html?date=${formattedDate}`;
                }
            });

            daysGrid.appendChild(dayDiv);
        }
    }

    function renderSchedule(day) {
        scheduleList.innerHTML = '';
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const allEvents = getStoredEvents().filter(event => event.date === dateStr);

        if (allEvents.length === 0) {
            const noEventsMessage = document.createElement('p');
            noEventsMessage.textContent = '本日无行程';
            noEventsMessage.style.textAlign = 'center';
            noEventsMessage.style.color = '#8e8e93';
            noEventsMessage.style.padding = '20px';
            scheduleList.appendChild(noEventsMessage);
            return;
        }



        allEvents.sort((a, b) => {
            const dateA = parseScheduleDate(a.startDate);
            const dateB = parseScheduleDate(b.startDate);
            if (dateA && dateB) {
                return dateA - dateB;
            }
            return 0;
        }).forEach(event => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.setAttribute('draggable', 'true');
            item.dataset.eventId = event.id;

            if (event.id) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    // Stop propagation to prevent the event from bubbling up to the parent
                    e.stopPropagation();
                    window.location.href = `add_event.html?id=${event.id}`;
                });
            }
            
            const colorBar = document.createElement('div');
            colorBar.className = 'color-bar';
            colorBar.style.backgroundColor = event.color || '#4A90E2';

            const itemContent = document.createElement('div');
            itemContent.className = 'item-content';

            const itemTitle = document.createElement('div');
            itemTitle.className = 'item-title';
            itemTitle.textContent = event.title;
            itemContent.appendChild(itemTitle);

            if (event.notes) {
                const itemNotes = document.createElement('div');
                itemNotes.className = 'item-notes';
                itemNotes.textContent = event.notes;
                itemContent.appendChild(itemNotes);
            }

            const itemTime = document.createElement('div');
            itemTime.className = 'item-time';

            const startTimeDiv = document.createElement('div');
            const startDate = parseScheduleDate(event.startDate);
            if (startDate) {
                startTimeDiv.textContent = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
            }
            itemTime.appendChild(startTimeDiv);

            const endTimeDiv = document.createElement('div');
            endTimeDiv.className = 'end-time';
            if (event.endDate) {
                const endDate = parseScheduleDate(event.endDate);
                if (endDate) {
                    endTimeDiv.textContent = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                }
            }
            itemTime.appendChild(endTimeDiv);

            item.appendChild(colorBar);
            item.appendChild(itemContent);



            item.appendChild(itemTime);

            const shouldShowButtons = (() => {
                const text = `${event.title || ''}${event.notes || ''}`;
                const keywords = ['现场','访谈','公司','合同','同区客户'];
                return keywords.some(k => text.includes(k));
            })();

            if (shouldShowButtons) {
                const checkInButton = document.createElement('a');
                checkInButton.href = `check_in.html?eventId=${event.id}&date=${event.date}&type=check-in&eventTitle=${encodeURIComponent(event.title)}`;
                checkInButton.textContent = '到场打卡';
                checkInButton.classList.add('check-in-btn');
                item.appendChild(checkInButton);

                const checkOutButton = document.createElement('a');
                checkOutButton.href = `check_in.html?eventId=${event.id}&date=${event.date}&type=check-out&eventTitle=${encodeURIComponent(event.title)}`;
                checkOutButton.textContent = '离场打卡';
                checkOutButton.classList.add('check-out-btn');
                item.appendChild(checkOutButton);
            }

            scheduleList.appendChild(item);

            const itemActions = document.createElement('div');
            itemActions.className = 'item-actions';

            const checkInBtn = item.querySelector('.check-in-btn');
            const checkOutBtn = item.querySelector('.check-out-btn');

            if (checkInBtn) itemActions.appendChild(checkInBtn);
            if (checkOutBtn) itemActions.appendChild(checkOutBtn);

            const timeElement = item.querySelector('.item-time');
            if (timeElement && itemActions.childElementCount > 0) {
                item.insertBefore(itemActions, timeElement);
            }
        });
    }

    scheduleList.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('schedule-item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.eventId);
            e.target.classList.add('dragging');
        }
    });

    scheduleList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(scheduleList, e.clientY);
        if (afterElement == null) {
            scheduleList.appendChild(draggingItem);
        } else {
            scheduleList.insertBefore(draggingItem, afterElement);
        }
    });

    scheduleList.addEventListener('drop', function(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (draggingItem) {
            updateEventDataAfterDrop(draggingItem);
            draggingItem.classList.remove('dragging');
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.schedule-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function parseScheduleDate(dateStr) {
        const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:(上午|下午))?\s*(\d{1,2}):(\d{2})/);
        if (!match) return null;

        let [, year, month, day, ampm, hours, minutes] = match;
        year = parseInt(year);
        month = parseInt(month) - 1;
        day = parseInt(day);
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if (ampm === '下午' && hours !== 12) {
            hours += 12;
        }
        if (ampm === '上午' && hours === 12) {
            hours = 0;
        }

        return new Date(year, month, day, hours, minutes);
    }

    function formatScheduleDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '下午' : '上午';

        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${year}年${month}月${day}日 ${ampm}${hours}:${minutes}`;
    }

    function updateEventDataAfterDrop(draggingItem) {
        const orderedItemElements = [...scheduleList.querySelectorAll('.schedule-item')];
        const orderedIds = orderedItemElements.map(item => item.dataset.eventId);
        let storedEvents = getStoredEvents();
        const draggedEventId = draggingItem.dataset.eventId;

        const draggedEventIndex = orderedIds.indexOf(draggedEventId);
        const draggedEvent = storedEvents.find(e => e.id === draggedEventId);

        if (!draggedEvent) return;

        const startDateObj = parseScheduleDate(draggedEvent.startDate);
        const endDateObj = parseScheduleDate(draggedEvent.endDate);
        if (!startDateObj || !endDateObj) return;
        const duration = endDateObj.getTime() - startDateObj.getTime();

        if (draggedEventIndex < orderedIds.length - 1) {
            const nextEventId = orderedIds[draggedEventIndex + 1];
            const nextEvent = storedEvents.find(e => e.id === nextEventId);
            if (nextEvent) {
                const nextEventStartDate = parseScheduleDate(nextEvent.startDate);
                if (nextEventStartDate) {
                    const newEndDate = new Date(nextEventStartDate.getTime());
                    const newStartDate = new Date(newEndDate.getTime() - duration);
                    draggedEvent.endDate = formatScheduleDate(newEndDate);
                    draggedEvent.startDate = formatScheduleDate(newStartDate);
                }
            }
        } else if (draggedEventIndex > 0) {
            const prevEventId = orderedIds[draggedEventIndex - 1];
            const prevEvent = storedEvents.find(e => e.id === prevEventId);
            if (prevEvent) {
                const prevEventEndDate = parseScheduleDate(prevEvent.endDate);
                if (prevEventEndDate) {
                    const newStartDate = new Date(prevEventEndDate.getTime());
                    const newEndDate = new Date(newStartDate.getTime() + duration);
                    draggedEvent.startDate = formatScheduleDate(newStartDate);
                    draggedEvent.endDate = formatScheduleDate(newEndDate);
                }
            }
        }

        const eventToUpdateIndex = storedEvents.findIndex(e => e.id === draggedEventId);
        if (eventToUpdateIndex > -1) {
            storedEvents[eventToUpdateIndex] = draggedEvent;
        }

        storedEvents.sort((a, b) => {
            const aIndex = orderedIds.indexOf(a.id);
            const bIndex = orderedIds.indexOf(b.id);
            if (aIndex === -1 || bIndex === -1) return 0;
            return aIndex - bIndex;
        });

        localStorage.setItem('events', JSON.stringify(storedEvents));

        const day = new Date(draggedEvent.date).getDate();
        renderSchedule(day);
    }

    // --- Search Functionality ---
    const searchIcon = document.querySelector('.header-actions .icon');
    let searchOverlay, searchInput, searchResults;

    function createSearchOverlay() {
        if (document.getElementById('search-overlay')) return;

        searchOverlay = document.createElement('div');
        searchOverlay.id = 'search-overlay';
        searchOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 1); z-index: 1000; padding: 15px;
            display: flex; flex-direction: column; box-sizing: border-box;
        `;

        const searchBar = document.createElement('div');
        searchBar.style.cssText = `display: flex; align-items: center; margin-bottom: 15px;`;

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索日程...';
        searchInput.style.cssText = `
            flex-grow: 1; padding: 10px; border: 1px solid #ccc; 
            border-radius: 5px; font-size: 16px;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '取消';
        closeButton.style.cssText = `
            background: none; border: none; font-size: 16px; 
            color: #007AFF; margin-left: 10px; cursor: pointer;
        `;

        searchResults = document.createElement('div');
        searchResults.id = 'search-results';
        searchResults.style.cssText = `overflow-y: auto;`;

        searchBar.appendChild(searchInput);
        searchBar.appendChild(closeButton);
        searchOverlay.appendChild(searchBar);
        searchOverlay.appendChild(searchResults);
        document.body.appendChild(searchOverlay);

        closeButton.addEventListener('click', () => {
            document.body.removeChild(searchOverlay);
        });

        searchInput.addEventListener('input', performSearch);
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';
        if (query.length < 1) return;

        const allEvents = getStoredEvents();
        const filteredEvents = allEvents.filter(event => 
            event.title.toLowerCase().includes(query)
        );

        // Group events by date
        const groupedByDate = filteredEvents.reduce((acc, event) => {
            const date = event.date; // Assuming YYYY-MM-DD format
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});

        // Sort dates and display
        Object.keys(groupedByDate).sort().forEach(date => {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date.replace(/-/g, '/');
            dateHeader.style.cssText = `font-size: 14px; color: #8e8e93; margin: 10px 0 5px;`;
            searchResults.appendChild(dateHeader);

            groupedByDate[date].forEach(event => {
                const resultItem = document.createElement('div');
                resultItem.textContent = event.title;
                resultItem.style.cssText = `
                    padding: 12px; background: #f0f0f0; border-radius: 5px; margin-bottom: 8px; cursor: pointer;
                `;
                resultItem.addEventListener('click', () => {
                    window.location.href = `index.html?date=${event.date}`;
                    document.body.removeChild(searchOverlay);
                });
                searchResults.appendChild(resultItem);
            });
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', createSearchOverlay);
    }

    // --- Clear Check-in Functionality ---
    const clearCheckinBtn = document.getElementById('clear-checkin-btn');
    if (clearCheckinBtn) {
        clearCheckinBtn.addEventListener('click', () => {
            if (confirm('您确定要清除所有的签到打卡记录吗？此操作不可撤销。')) {
                const allEvents = getStoredEvents();
                const updatedEvents = allEvents.map(event => {
                    delete event.checkIn;
                    delete event.checkOut;
                    return event;
                });
                localStorage.setItem('events', JSON.stringify(updatedEvents));
                events = getStoredEvents(); // Re-fetch events to update the global variable
                // Re-render the calendar to reflect the changes
                renderCalendar(currentYear, currentMonth);
                // Also update the schedule view for the currently selected day
                const selectedDayElem = document.querySelector('.day.selected');
                if (selectedDayElem) {
                    renderSchedule(parseInt(selectedDayElem.textContent));
                } else {
                    // If no day is selected, maybe render for today or clear the schedule view
                    document.getElementById('schedule-list').innerHTML = '';
                }
                alert('所有签到打卡记录已成功清除。');
            }
        });
    }
});
