<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Placemark;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

use Pagerfanta\Adapter\DoctrineORMAdapter;
use Pagerfanta\Pagerfanta;
use Pagerfanta\View\DefaultView;

class PlacemarkerController extends Controller
{
    /**
     *  Главная страница
     *
     * @Route("/")
     * @Template("AppBundle:default:table.html.twig")
     * @param Request $request
     * @return array
     */
    public function showAction(Request $request)
    {
        $curPage = $request->query->get('page');

        if (!$curPage) $curPage = 1;

        $repo = $this->getDoctrine()->getRepository('AppBundle:Placemark');

        // Список меток
        $placeMarksList = $repo->findPlaceOrderedByName(($curPage - 1) * 10);

        // Пагинация
        $pagerfanta = new Pagerfanta(new DoctrineORMAdapter($repo->queryForPagination()));

        $pagerfanta->setMaxPerPage(10)->setCurrentPage($curPage);

        $routeGenerator = function ($page) {
            return '/?page=' . $page;
        };

        $view = new DefaultView();
        $options = array('proximity' => 3);
        $pagination = $view->render($pagerfanta, $routeGenerator, $options);

        return ['placeMarksList' => $placeMarksList, 'pagination' => $pagination];
    }

    /**
     *  Новая метка
     *
     * @Route("placemarks/add")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function addAction(Request $request)
    {

        $data = json_decode($request->query->get('user_data'), true);

        $place = new Placemark();

        $place->setName($data['name']);
        $place->setLat($data['lat']);
        $place->setLon($data['lon']);

        $em = $this->getDoctrine()->getManager();
        $em->persist($place);
        $em->flush();

        return $this->json(['msg' => 'Добавлено успешно !',
                'status' => true,
                'id' => $place->getId()]
        );
    }

    /**
     *  Удаление Метки
     *
     * @Route("placemarks/delete/{id}")
     *
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function deleteAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();
        $place = $em->getRepository('AppBundle:Placemark')->find($id);

        if ($place) {
            $em->remove($place);
            $em->flush();
            return $this->json(['msg' => 'Метка удалена успешно !', 'status' => true]);
        } else {
            return $this->json(['msg' => 'Ошибка ! (', 'status' => false]);
        }
    }

    /**
     *  Редактирование Метки
     *
     * @Route("placemarks/edit/{id}")
     *
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function editAction(Request $request, $id)
    {
        $data = json_decode($request->query->get('user_data'), true);

        $em = $this->getDoctrine()->getManager();

        $place = $em->getRepository('AppBundle:Placemark')->find($id);

        if ($place) {

            $place->setName($data['name']);
            $place->setLat($data['lat']);
            $place->setLon($data['lon']);
            $em->flush();

            return $this->json(['msg' => 'Метка Изменена успешно !', 'status' => true]);
        }
        else {
            return $this->json(['msg' => 'Ошибка ! (', 'status' => false]);
        }
    }

    /**
     *  Задать область поиска
     *
     * @Route("/search")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function searchAction()
    {
        return $this->render('AppBundle:default:search_map.html.twig');
    }

    /**
     *  Результат поиска меток
     *
     * @Route("/result")
     * @Template("AppBundle:default:result.html.twig")
     * @param Request $request
     * @return array
     */
    public function resultAction(Request $request)
    {
        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');

        $radius = $request->query->get('radius');

        $res = $this->getDoctrine()
            ->getRepository('AppBundle:Placemark')
            ->findPlacemarks($lat, $lon, $radius);

        $area = ['lat' => $lat, 'lon' => $lon, 'radius' => $radius * 1000];

        return ['res' => $res, 'area' => $area];
    }
}
